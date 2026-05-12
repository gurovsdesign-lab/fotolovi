"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FREE_EVENT_PHOTO_LIMIT } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createSlug } from "@/lib/utils";
import { requireUser } from "@/features/auth/queries";

export type EventActionState = {
  error?: string;
};

export type RenameEventResult = {
  error?: string;
  title?: string;
};

export async function createEventAction(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const eventDate = String(formData.get("eventDate") || "");
  const useCredit = formData.get("useCredit") === "on";

  if (!title || !eventDate) {
    return { error: "Укажите название и дату мероприятия" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: credit, error: creditError } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (creditError) {
    console.error("Failed to load credits before event creation", {
      userId: user.id,
      message: creditError.message,
    });
    return { error: "Не удалось проверить credits" };
  }

  const creditAny = credit as any;

  if (useCredit && (!creditAny || creditAny.amount < 1)) {
    return { error: "Недостаточно credits для платного мероприятия" };
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title,
      event_date: eventDate,
      slug: createSlug(title),
      is_paid: useCredit,
      photo_limit: useCredit ? 1000 : FREE_EVENT_PHOTO_LIMIT,
    } as any)
    .select("id")
    .single();

  if (error || !data) {
    console.log("EVENT CREATE ERROR:", error);
    return { error: error?.message || "Не удалось создать мероприятие" };
  }

  const eventAny = data as any;

  if (useCredit) {
    const { data: debited, error: debitError } = await (supabase as any).rpc("debit_current_user_credit", {
      p_reason: `Создание мероприятия: ${title}`,
    });

    if (debitError || debited !== true) {
      console.error("Failed to debit credit for paid event", {
        userId: user.id,
        eventId: eventAny.id,
        message: debitError?.message ?? "Credit debit returned false",
      });
      await supabase.from("events").delete().eq("id", eventAny.id).eq("user_id", user.id);
      return { error: debitError?.message || "Недостаточно credits для платного мероприятия" };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect(`/dashboard/events/${eventAny.id}`);
}

export async function deleteEventAction(formData: FormData) {
  await requireUser();
  const eventId = String(formData.get("eventId") || "");

  if (!eventId) return;

  const supabase = await createServerSupabaseClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("event_id", eventId);

  if (photos?.length) {
    await supabase.storage.from("event-photos").remove(photos.map((photo: any) => photo.storage_path));
  }

  await supabase.from("photos").delete().eq("event_id", eventId);
  await supabase.from("events").delete().eq("id", eventId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function renameEventAction(eventId: string, title: string): Promise<RenameEventResult> {
  const user = await requireUser();
  const nextTitle = title.trim();

  if (!eventId) {
    return { error: "Не удалось определить мероприятие" };
  }

  if (!nextTitle) {
    return { error: "Название не может быть пустым" };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await (supabase.from("events") as any)
    .update({ title: nextTitle } as any)
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select("title")
    .single();

  if (error || !data) {
    return { error: error?.message || "Не удалось переименовать мероприятие" };
  }

  const event = data as any;
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);

  return { title: event.title };
}

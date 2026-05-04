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
  const { data: credit } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

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
    })
    .select("id")
    .single();

    if (error || !data) {
      console.log("EVENT CREATE ERROR:", error);
      return { error: error?.message || "Не удалось создать мероприятие" };
    }

  if (useCredit && creditAny) {
    await supabase
      .from("credits")
      .update({ amount: creditAny.amount - 1, updated_at: new Date().toISOString() } as any)
      .eq("user_id", user.id);
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -1,
      reason: `Создание мероприятия: ${title}`,
    } as any);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/events/${data.id}`);
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

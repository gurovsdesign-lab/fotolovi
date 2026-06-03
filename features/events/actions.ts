"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FREE_EVENT_PHOTO_LIMIT, MAX_EVENT_TITLE_LENGTH, PAID_EVENT_PHOTO_LIMIT } from "@/lib/constants";
import {
  createGuestAccessCookieName,
  getTodayDateString,
  isGuestAccessMode,
  isModerationMode,
  normalizeGuestAccessMode,
  normalizeModerationMode,
  type GuestAccessMode,
  type ModerationMode,
} from "@/lib/eventSettings";
import { getEventLifecycle, isEventDateEditable } from "@/lib/eventStatus";
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

export type UpdateEventDateResult = {
  error?: string;
  eventDate?: string;
};

export type EventSettingsResult = {
  error?: string;
  settings?: {
    guestAccessCodeEnabled: boolean;
    guestAccessCode: string | null;
    guestAccessMode: GuestAccessMode;
    moderationMode: ModerationMode;
  };
};

export type GuestAccessCodeResult = {
  error?: string;
  success?: boolean;
};

export async function createEventAction(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const eventDate = String(formData.get("eventDate") || "");
  const eventType = String(formData.get("eventType") || "test");
  const useCredit = eventType === "premium" || formData.get("useCredit") === "on";

  if (!title || !eventDate) {
    return { error: "Укажите название и дату мероприятия" };
  }

  if (title.length > MAX_EVENT_TITLE_LENGTH) {
    return { error: `Название должно быть не длиннее ${MAX_EVENT_TITLE_LENGTH} символов` };
  }

  if (!isDateInputValue(eventDate)) {
    return { error: "Укажите дату в формате ГГГГ-ММ-ДД" };
  }

  if (eventDate < getTodayDateString()) {
    return { error: "Эта дата уже прошла" };
  }

  if (eventType !== "test" && eventType !== "premium") {
    return { error: "Выберите тип мероприятия" };
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
      photo_limit: useCredit ? PAID_EVENT_PHOTO_LIMIT : FREE_EVENT_PHOTO_LIMIT,
    } as any)
    .select("id")
    .single();

  if (error || !data) {
    console.log("EVENT CREATE ERROR:", error);
    return { error: error?.message || "Не удалось создать мероприятие" };
  }

  const eventAny = data as any;

  if (useCredit) {
    const { data: debited, error: debitError } = await (supabase as any).rpc(
      "debit_current_user_credit",
      {
        p_reason: `Создание мероприятия: ${title}`,
      },
    );

    if (debitError || debited !== true) {
      console.error("Failed to debit credit for paid event", {
        userId: user.id,
        eventId: eventAny.id,
        message: debitError?.message ?? "Credit debit returned false",
      });
      await supabase.from("events").delete().eq("id", eventAny.id).eq("user_id", user.id);
      return {
        error: debitError?.message || "Недостаточно credits для платного мероприятия",
      };
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

export async function renameEventAction(
  eventId: string,
  title: string,
): Promise<RenameEventResult> {
  const user = await requireUser();
  const nextTitle = title.trim();

  if (!eventId) {
    return { error: "Не удалось определить мероприятие" };
  }

  if (!nextTitle) {
    return { error: "Название не может быть пустым" };
  }

  if (nextTitle.length > MAX_EVENT_TITLE_LENGTH) {
    return { error: `Название должно быть не длиннее ${MAX_EVENT_TITLE_LENGTH} символов` };
  }

  const supabase = await createServerSupabaseClient();
  const { data: currentEvent, error: loadError } = await supabase
    .from("events")
    .select("event_date")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (loadError || !currentEvent) {
    return { error: loadError?.message || "Не удалось найти мероприятие" };
  }

  const currentEventData = currentEvent as unknown as { event_date: string };

  if (!isEventDateEditable(getEventLifecycle(currentEventData.event_date))) {
    return { error: "Название можно менять только до завершения текущего мероприятия" };
  }

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

export async function updateEventDateAction(
  eventId: string,
  eventDate: string,
): Promise<UpdateEventDateResult> {
  const user = await requireUser();
  const nextDate = eventDate.trim();
  const today = getTodayDateString();

  if (!eventId) {
    return { error: "Не удалось определить мероприятие" };
  }

  if (!isDateInputValue(nextDate)) {
    return { error: "Укажите дату в формате ГГГГ-ММ-ДД" };
  }

  if (nextDate < today) {
    return { error: "Нельзя установить дату в прошлом" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: currentEvent, error: loadError } = await supabase
    .from("events")
    .select("event_date,slug")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (loadError || !currentEvent) {
    return { error: loadError?.message || "Не удалось найти мероприятие" };
  }

  const currentEventData = currentEvent as unknown as {
    event_date: string;
    slug: string;
  };

  if (!isEventDateEditable(getEventLifecycle(currentEventData.event_date))) {
    return { error: "Дата прошедшего мероприятия заблокирована" };
  }

  const { data, error } = await supabase
    .from("events")
    .update({ event_date: nextDate } as never)
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select("event_date")
    .single();

  if (error || !data) {
    return { error: error?.message || "Не удалось обновить дату" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/event/${currentEventData.slug}`);
  revalidatePath(`/live/${currentEventData.slug}`);

  const updatedEvent = data as unknown as { event_date: string };
  return { eventDate: updatedEvent.event_date };
}

export async function updateEventSettingsAction(
  formData: FormData,
): Promise<EventSettingsResult> {
  const user = await requireUser();
  const eventId = String(formData.get("eventId") || "");
  const guestAccessCodeEnabled = formData.get("guestAccessCodeEnabled") === "on";
  const shouldRegenerateAccessCode = formData.get("regenerateAccessCode") === "true";
  const submittedAccessCode = String(formData.get("guestAccessCode") || "").trim();
  const submittedGuestAccessMode = String(formData.get("guestAccessMode") || "");
  const submittedModerationMode = String(formData.get("moderationMode") || "");
  const guestAccessMode = normalizeGuestAccessMode(submittedGuestAccessMode);
  const moderationMode = normalizeModerationMode(submittedModerationMode);

  if (!eventId) {
    return { error: "Не удалось определить мероприятие" };
  }

  if (submittedGuestAccessMode && !isGuestAccessMode(submittedGuestAccessMode)) {
    return { error: "Выберите режим доступа гостей" };
  }

  if (submittedModerationMode && !isModerationMode(submittedModerationMode)) {
    return { error: "Выберите режим модерации" };
  }

  if (
    guestAccessCodeEnabled &&
    submittedAccessCode &&
    !/^\d{4}$/.test(submittedAccessCode)
  ) {
    return { error: "Код доступа должен состоять из 4 цифр" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: currentEvent, error: loadError } = await supabase
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (loadError || !currentEvent) {
    return { error: loadError?.message || "Не удалось найти мероприятие" };
  }

  const currentEventData = currentEvent as unknown as { slug: string };
  const nextAccessCode = guestAccessCodeEnabled
    ? shouldRegenerateAccessCode || !submittedAccessCode
      ? createFourDigitCode()
      : submittedAccessCode
    : null;

  const { data, error } = await supabase
    .from("events")
    .update({
      guest_access_code_enabled: guestAccessCodeEnabled,
      guest_access_code: nextAccessCode,
      guest_access_mode: guestAccessMode,
      moderation_mode: moderationMode,
    } as never)
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select(
      "guest_access_code_enabled,guest_access_code,guest_access_mode,moderation_mode",
    )
    .single();

  if (error || !data) {
    return { error: error?.message || "Не удалось сохранить настройки" };
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/event/${currentEventData.slug}`);
  revalidatePath(`/live/${currentEventData.slug}`);

  const settings = data as unknown as {
    guest_access_code_enabled: boolean;
    guest_access_code: string | null;
    guest_access_mode?: string | null;
    moderation_mode?: string | null;
  };
  return {
    settings: {
      guestAccessCodeEnabled: settings.guest_access_code_enabled,
      guestAccessCode: settings.guest_access_code,
      guestAccessMode: normalizeGuestAccessMode(settings.guest_access_mode),
      moderationMode: normalizeModerationMode(settings.moderation_mode),
    },
  };
}

export async function verifyGuestAccessCodeAction(
  slug: string,
  code: string,
): Promise<GuestAccessCodeResult> {
  const submittedCode = code.trim();

  if (!/^\d{4}$/.test(submittedCode)) {
    return { error: "Введите 4-значный код" };
  }

  const supabase = await createServerSupabaseClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !event) {
    return { error: error?.message || "Мероприятие не найдено" };
  }

  const guestEvent = event as unknown as {
    slug: string;
    guest_access_code_enabled: boolean;
    guest_access_code: string | null;
  };

  if (!guestEvent.guest_access_code_enabled) {
    return { success: true };
  }

  if (guestEvent.guest_access_code !== submittedCode) {
    return { error: "Неверный код доступа" };
  }

  const cookieStore = await cookies();
  cookieStore.set(createGuestAccessCookieName(guestEvent.slug), submittedCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  revalidatePath(`/event/${guestEvent.slug}`);
  return { success: true };
}

function isDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function createFourDigitCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 10000).padStart(4, "0");
}

"use server";

import { revalidatePath } from "next/cache";
import { PHOTO_BUCKET } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { requireUser } from "@/features/auth/queries";

export type ParticipantFields = {
  displayName?: string;
  title?: string;
  subtitle?: string;
  body?: string;
};

export type SpotlightActionResult = {
  error?: string;
};

type ManageableEvent = {
  id: string;
  slug: string;
  user_id: string;
};

type ParticipantValues = {
  display_name: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  updated_at?: string;
};

type ParticipantInsert = ParticipantValues & {
  event_id: string;
};

type LiveStateUpsert = {
  event_id: string;
  mode: "live" | "spotlight";
  active_participant_id: string | null;
  updated_by: string;
  updated_at: string;
};

type ParticipantIdentity = {
  id: string;
  event_id: string;
};

type ParticipantPhotoIdentity = {
  id: string;
  participant_id: string;
  event_id: string;
  storage_path: string;
};

type LiveStateIdentity = {
  active_participant_id: string | null;
};

type ProfileRole = {
  role: "user" | "admin";
};

type DbError = { message: string } | null;
type MutationResponse = { error: DbError };

type InsertTable<T> = {
  insert(values: T): Promise<MutationResponse>;
};

type UpsertTable<T> = {
  upsert(values: T, options: { onConflict: string }): Promise<MutationResponse>;
};

type MutationFilter = PromiseLike<MutationResponse> & {
  eq(column: string, value: string): MutationFilter;
};

type UpdateTable<T> = {
  update(values: T): MutationFilter;
  delete(): MutationFilter;
};

type SelectQuery<T> = {
  eq(column: string, value: string): SelectQuery<T>;
  maybeSingle(): Promise<{ data: T | null; error: DbError }>;
};

type SelectTable<T> = {
  select(columns: string): SelectQuery<T>;
};

type SelectListFilter<T> = PromiseLike<{ data: T[] | null; error: DbError }> & {
  eq(column: string, value: string): SelectListFilter<T>;
};

type SelectListTable<T> = {
  select(columns: string): SelectListFilter<T>;
};

const TITLE_MAX_LENGTH = 40;
const SUBTITLE_MAX_LENGTH = 70;
const BODY_MAX_LENGTH = 300;
const DISPLAY_NAME_MAX_LENGTH = 80;

export async function createParticipantAction(
  eventId: string,
  fields: ParticipantFields,
): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const event = await requireManageableEvent(supabase, eventId);
    const values = validateParticipantFields(fields);

    if ("error" in values) return values;

    const participantsTable = supabase.from("spotlight_participants") as unknown as InsertTable<ParticipantInsert>;
    const { error } = await participantsTable.insert({
      event_id: event.id,
      display_name: values.displayName,
      title: values.title,
      subtitle: values.subtitle,
      body: values.body,
    });

    if (error) {
      console.error("Failed to create spotlight participant", {
        eventId,
        message: error.message,
      });
      return { error: "Не удалось добавить участника" };
    }

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

export async function updateParticipantAction(
  participantId: string,
  fields: ParticipantFields,
): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const participant = await requireManageableParticipant(supabase, participantId);
    const event = await requireManageableEvent(supabase, participant.event_id);
    const values = validateParticipantFields(fields);

    if ("error" in values) return values;

    const participantsTable = supabase.from("spotlight_participants") as unknown as UpdateTable<ParticipantValues>;
    const { error } = await participantsTable
      .update({
        display_name: values.displayName,
        title: values.title,
        subtitle: values.subtitle,
        body: values.body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", participantId)
      .eq("event_id", event.id);

    if (error) {
      console.error("Failed to update spotlight participant", {
        participantId,
        eventId: event.id,
        message: error.message,
      });
      return { error: "Не удалось сохранить участника" };
    }

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

export async function deleteParticipantAction(participantId: string): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const participant = await requireManageableParticipant(supabase, participantId);
    const event = await requireManageableEvent(supabase, participant.event_id);

    const liveStatesTable = supabase.from("live_screen_states") as unknown as SelectTable<LiveStateIdentity>;
    const { data: liveState, error: liveStateError } = await liveStatesTable
      .select("active_participant_id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (!liveStateError && liveState?.active_participant_id === participantId) {
      const ended = await setLiveScreenMode(supabase, event.id, "live", null);
      if (ended.error) return ended;
    }

    const photosTable = supabase.from("spotlight_participant_photos") as unknown as SelectListTable<ParticipantPhotoIdentity>;
    const { data: photos, error: photosError } = await photosTable
      .select("id,participant_id,event_id,storage_path")
      .eq("participant_id", participantId)
      .eq("event_id", event.id);

    if (photosError) {
      console.error("Failed to load spotlight participant photos before delete", {
        participantId,
        eventId: event.id,
        message: photosError.message,
      });
      return { error: "Не удалось подготовить фото участника к удалению" };
    }

    const storagePaths = (photos ?? []).map((photo) => photo.storage_path).filter(Boolean);
    if (storagePaths.length) {
      const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove(storagePaths);

      if (storageError) {
        console.error("Failed to remove spotlight participant photos from storage", {
          participantId,
          eventId: event.id,
          message: storageError.message,
        });
        return { error: "Не удалось удалить фото участника" };
      }
    }

    const participantsTable = supabase.from("spotlight_participants") as unknown as UpdateTable<ParticipantValues>;
    const { error } = await participantsTable
      .delete()
      .eq("id", participantId)
      .eq("event_id", event.id);

    if (error) {
      console.error("Failed to delete spotlight participant", {
        participantId,
        eventId: event.id,
        message: error.message,
      });
      return { error: "Не удалось удалить участника" };
    }

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

export async function deleteParticipantPhotoAction(photoId: string): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const photosTable = supabase.from("spotlight_participant_photos") as unknown as SelectTable<ParticipantPhotoIdentity>;
    const { data: photo, error: photoError } = await photosTable
      .select("id,participant_id,event_id,storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (photoError || !photo) {
      return { error: "Фото участника не найдено" };
    }

    const event = await requireManageableEvent(supabase, photo.event_id);

    const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);

    if (storageError) {
      console.error("Failed to remove spotlight participant photo from storage", {
        photoId,
        eventId: event.id,
        storagePath: photo.storage_path,
        message: storageError.message,
      });
      return { error: "Не удалось удалить файл фото" };
    }

    const deleteTable = supabase.from("spotlight_participant_photos") as unknown as UpdateTable<ParticipantValues>;
    const { error } = await deleteTable.delete().eq("id", photo.id).eq("event_id", event.id);

    if (error) {
      console.error("Failed to delete spotlight participant photo row", {
        photoId,
        eventId: event.id,
        message: error.message,
      });
      return { error: "Не удалось удалить фото участника" };
    }

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

export async function startSpotlightAction(
  eventId: string,
  participantId: string,
): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const event = await requireManageableEvent(supabase, eventId);
    const participant = await requireManageableParticipant(supabase, participantId);

    if (participant.event_id !== event.id) {
      return { error: "Этот участник относится к другому мероприятию" };
    }

    const result = await setLiveScreenMode(supabase, event.id, "spotlight", participant.id);
    if (result.error) return result;

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

export async function endSpotlightAction(eventId: string): Promise<SpotlightActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const event = await requireManageableEvent(supabase, eventId);
    const result = await setLiveScreenMode(supabase, event.id, "live", null);

    if (result.error) return result;

    revalidateEventPaths(event);
    return {};
  } catch (error) {
    return createSafeActionError(error);
  }
}

function validateParticipantFields(fields: ParticipantFields) {
  const displayName = normalizeOptionalText(fields.displayName);
  const title = String(fields.title || "").trim();
  const subtitle = normalizeOptionalText(fields.subtitle);
  const body = normalizeOptionalText(fields.body);

  if (!title) return { error: "Добавьте заголовок для представления" };
  if (title.length > TITLE_MAX_LENGTH) return { error: `Заголовок: максимум ${TITLE_MAX_LENGTH} символов` };
  if (displayName && displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return { error: `Имя для ведущего: максимум ${DISPLAY_NAME_MAX_LENGTH} символов` };
  }
  if (subtitle && subtitle.length > SUBTITLE_MAX_LENGTH) {
    return { error: `Подзаголовок: максимум ${SUBTITLE_MAX_LENGTH} символов` };
  }
  if (body && body.length > BODY_MAX_LENGTH) return { error: `Основной текст: максимум ${BODY_MAX_LENGTH} символов` };

  return {
    displayName,
    title,
    subtitle,
    body,
  };
}

function normalizeOptionalText(value: string | undefined) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

async function requireManageableEvent(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  eventId: string,
): Promise<ManageableEvent> {
  const user = await requireUser();
  const isAdmin = await getIsAdmin(supabase, user.id);
  let query = supabase.from("events").select("id,slug,user_id").eq("id", eventId);

  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    console.warn("Rejected spotlight action for inaccessible event", {
      eventId,
      userId: user.id,
      isAdmin,
      message: error?.message,
    });
    throw new Error("Мероприятие не найдено или недоступно");
  }

  return data;
}

async function requireManageableParticipant(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  participantId: string,
) {
  const participantsTable = supabase.from("spotlight_participants") as unknown as SelectTable<ParticipantIdentity>;
  const { data, error } = await participantsTable
    .select("id,event_id")
    .eq("id", participantId)
    .maybeSingle();

  if (error || !data) {
    console.warn("Rejected spotlight action for inaccessible participant", {
      participantId,
      message: error?.message,
    });
    throw new Error("Участник не найден или недоступен");
  }

  return data;
}

async function getIsAdmin(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
) {
  const profilesTable = supabase.from("profiles") as unknown as SelectTable<ProfileRole>;
  const { data } = await profilesTable.select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

async function setLiveScreenMode(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  eventId: string,
  mode: "live" | "spotlight",
  activeParticipantId: string | null,
): Promise<SpotlightActionResult> {
  const user = await requireUser();
  const liveStatesTable = supabase.from("live_screen_states") as unknown as UpsertTable<LiveStateUpsert>;
  const { error } = await liveStatesTable.upsert(
    {
      event_id: eventId,
      mode,
      active_participant_id: activeParticipantId,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id" },
  );

  if (error) {
    console.error("Failed to update live screen state", {
      eventId,
      mode,
      activeParticipantId,
      message: error.message,
    });
    return { error: "Не удалось обновить состояние экрана" };
  }

  return {};
}

function revalidateEventPaths(event: ManageableEvent) {
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/live/${event.slug}`);
  revalidatePath(`/screen/${event.slug}`);
}

function createSafeActionError(error: unknown): SpotlightActionResult {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("недоступ")) {
    return { error: "Нет доступа к этому мероприятию или участнику" };
  }

  return { error: "Не удалось выполнить действие. Попробуйте ещё раз" };
}

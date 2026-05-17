import { NextResponse } from "next/server";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_UPLOAD_REQUEST_FILE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  PHOTO_BUCKET,
} from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getFileExtension } from "@/lib/utils";
import { requireUser } from "@/features/auth/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type ParticipantIdentity = {
  id: string;
  event_id: string;
};

type EventIdentity = {
  id: string;
  slug: string;
  user_id: string;
};

type ProfileRole = {
  role: "user" | "admin";
};

type DbError = { message: string } | null;

type SelectQuery<T> = {
  eq(column: string, value: string): SelectQuery<T>;
  maybeSingle(): Promise<{ data: T | null; error: DbError }>;
};

type SelectTable<T> = {
  select(columns: string): SelectQuery<T>;
};

type InsertTable<T> = {
  insert(values: T): {
    select(columns: string): {
      single(): Promise<{ data: unknown; error: DbError }>;
    };
  };
};

type SpotlightPhotoInsert = {
  participant_id: string;
  event_id: string;
  storage_path: string;
  public_url: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ participantId: string }> },
) {
  const { participantId } = await params;
  const supabase = await createServerSupabaseClient();
  const access = await requireManageableParticipant(supabase, participantId);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const formData = await request.formData();
  const files = getUploadFiles(formData);

  if (!files.length) {
    return NextResponse.json({ error: "Выберите фото участника" }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json(
      { error: `Можно загрузить не больше ${MAX_FILES_PER_UPLOAD} фото за один раз` },
      { status: 400 },
    );
  }

  if (files.some((file) => file.type && !file.type.startsWith("image/"))) {
    return NextResponse.json({ error: "Можно загружать только изображения" }, { status: 400 });
  }

  if (files.some((file) => file.size > MAX_UPLOAD_SIZE_BYTES)) {
    return NextResponse.json({ error: "Файл слишком большой" }, { status: 400 });
  }

  if (files.some((file) => file.size > MAX_UPLOAD_REQUEST_FILE_BYTES)) {
    return NextResponse.json({ error: "Файл слишком большой для запроса" }, { status: 400 });
  }

  const uploadedPhotos: unknown[] = [];

  for (const file of files) {
    const storagePath = `${access.event.id}/spotlight/${participantId}/${Date.now()}-${createUploadId()}.${getFileExtension(file)}`;
    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (uploadError) {
      console.error("Failed to upload spotlight participant photo", {
        participantId,
        eventId: access.event.id,
        storagePath,
        message: uploadError.message,
      });
      return NextResponse.json({ error: "Не удалось загрузить фото. Попробуйте ещё раз" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const photosTable = supabase.from("spotlight_participant_photos") as unknown as InsertTable<SpotlightPhotoInsert>;
    const { data: photo, error: insertError } = await photosTable
      .insert({
        participant_id: participantId,
        event_id: access.event.id,
        storage_path: storagePath,
        public_url: publicData.publicUrl,
      })
      .select("*")
      .single();

    if (insertError) {
      await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
      console.error("Failed to save spotlight participant photo row", {
        participantId,
        eventId: access.event.id,
        storagePath,
        message: insertError.message,
      });
      return NextResponse.json({ error: "Не удалось сохранить фото. Попробуйте ещё раз" }, { status: 500 });
    }

    uploadedPhotos.push(photo);
  }

  return NextResponse.json({ photos: uploadedPhotos });
}

async function requireManageableParticipant(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  participantId: string,
): Promise<
  | { ok: true; event: EventIdentity; participant: ParticipantIdentity }
  | { ok: false; status: number; error: string }
> {
  const user = await requireUser();
  const participantsTable = supabase.from("spotlight_participants") as unknown as SelectTable<ParticipantIdentity>;
  const { data: participant, error: participantError } = await participantsTable
    .select("id,event_id")
    .eq("id", participantId)
    .maybeSingle();

  if (participantError || !participant) {
    return { ok: false, status: 404, error: "Участник не найден" };
  }

  const profilesTable = supabase.from("profiles") as unknown as SelectTable<ProfileRole>;
  const { data: profile } = await profilesTable.select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";

  const eventsTable = supabase.from("events") as unknown as SelectTable<EventIdentity>;
  let eventQuery = eventsTable.select("id,slug,user_id").eq("id", participant.event_id);

  if (!isAdmin) {
    eventQuery = eventQuery.eq("user_id", user.id);
  }

  const { data: event, error: eventError } = await eventQuery.maybeSingle();

  if (eventError || !event) {
    return { ok: false, status: 403, error: "Нет доступа к этому участнику" };
  }

  return { ok: true, event, participant };
}

function getUploadFiles(formData: FormData) {
  const files = formData.getAll("files").filter((file): file is File => file instanceof File);
  if (files.length) return files;

  const file = formData.get("file");
  return file instanceof File ? [file] : [];
}

function createUploadId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

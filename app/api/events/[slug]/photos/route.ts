import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLiveScreenPhotos } from "@/features/live/queries";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_UPLOAD_REQUEST_FILE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  PAID_EVENT_PHOTO_LIMIT,
  PHOTO_BUCKET,
} from "@/lib/constants";
import { createGuestAccessCookieName, normalizeModerationMode } from "@/lib/eventSettings";
import { getEventLifecycle } from "@/lib/eventStatus";
import { createPublicSupabaseClient } from "@/lib/supabasePublic";
import { getFileExtension } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id,event_date")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event photos API event by slug", {
      slug,
      message: error.message,
    });
    return createNoStorePhotosResponse([]);
  }

  const liveEvent = event as { id: string; event_date: string } | null;

  if (!liveEvent) {
    return createNoStorePhotosResponse([], 404);
  }

  if (!getEventLifecycle(liveEvent.event_date).permissions.canShowLivePhotos) {
    return createNoStorePhotosResponse([]);
  }

  const photos = await getLiveScreenPhotos(liveEvent.id);

  return createNoStorePhotosResponse(photos);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formData = await request.formData();
  const files = getUploadFiles(formData);

  if (!files.length) {
    return NextResponse.json({ error: "Выберите фото для загрузки" }, { status: 400 });
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

  const supabase = createPublicSupabaseClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    console.error("Failed to load upload event by slug", {
      slug,
      message: eventError.message,
    });
    return NextResponse.json({ error: "Не удалось найти мероприятие" }, { status: 500 });
  }

  const uploadEvent = event as {
    id: string;
    slug: string;
    event_date: string;
    is_paid?: boolean | null;
    photo_limit: number;
    guest_access_code_enabled: boolean;
    guest_access_code: string | null;
    moderation_mode?: string | null;
  } | null;

  if (!uploadEvent) {
    return NextResponse.json({ error: "Мероприятие не найдено" }, { status: 404 });
  }

  if (!getEventLifecycle(uploadEvent.event_date).permissions.canUpload) {
    return NextResponse.json({ error: "Загрузка фотографий для этого мероприятия недоступна" }, { status: 403 });
  }

  const photoLimit = uploadEvent.is_paid ? PAID_EVENT_PHOTO_LIMIT : uploadEvent.photo_limit;

  if (uploadEvent.guest_access_code_enabled) {
    const cookieStore = await cookies();
    const cookieCode = cookieStore.get(createGuestAccessCookieName(uploadEvent.slug))?.value;
    const submittedCode = String(formData.get("accessCode") || "").trim();
    const accessCode = submittedCode || cookieCode;

    if (accessCode !== uploadEvent.guest_access_code) {
      return NextResponse.json({ error: "Введите код доступа с live screen" }, { status: 403 });
    }
  }

  const { count, error: countError } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", uploadEvent.id);

  if (countError) {
    console.error("Failed to count event photos before upload", {
      eventId: uploadEvent.id,
      message: countError.message,
    });
    return NextResponse.json({ error: "Не удалось проверить лимит фото" }, { status: 500 });
  }

  if ((count ?? 0) >= photoLimit) {
    return NextResponse.json({ error: "Лимит фото для этого мероприятия уже достигнут" }, { status: 400 });
  }

  if ((count ?? 0) + files.length > photoLimit) {
    return NextResponse.json(
      { error: `Можно добавить ещё ${Math.max(0, photoLimit - (count ?? 0))} фото` },
      { status: 400 },
    );
  }

  const photos: unknown[] = [];

  for (const file of files) {
    const storagePath = `${uploadEvent.id}/${Date.now()}-${createUploadId()}.${getFileExtension(file)}`;
    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (uploadError) {
      console.error("Failed to upload event photo via API", {
        slug,
        eventId: uploadEvent.id,
        storagePath,
        message: uploadError.message,
      });
      return NextResponse.json({ error: "Не удалось загрузить фото. Попробуйте ещё раз" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const { data: photo, error: insertError } = await supabase
      .from("photos")
      .insert({
        event_id: uploadEvent.id,
        storage_path: storagePath,
        public_url: publicData.publicUrl,
        is_hidden: normalizeModerationMode(uploadEvent.moderation_mode) === "premoderation",
      } as never)
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to save uploaded event photo via API", {
        slug,
        eventId: uploadEvent.id,
        storagePath,
        message: insertError.message,
      });
      return NextResponse.json({ error: "Не удалось сохранить фото. Попробуйте ещё раз" }, { status: 500 });
    }

    photos.push(photo);
  }

  return NextResponse.json({ photo: photos[0], photos });
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

function createNoStorePhotosResponse(
  photos: Awaited<ReturnType<typeof getLiveScreenPhotos>>,
  status = 200,
) {
  return NextResponse.json(
    { photos },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
}

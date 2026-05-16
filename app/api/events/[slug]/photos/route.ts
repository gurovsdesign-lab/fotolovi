import { NextResponse } from "next/server";
import { getLiveScreenPhotos } from "@/features/live/queries";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_UPLOAD_SIZE_BYTES,
  PHOTO_BUCKET,
} from "@/lib/constants";
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
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event photos API event by slug", {
      slug,
      message: error.message,
    });
    return createNoStorePhotosResponse([]);
  }

  const liveEvent = event as { id: string } | null;

  if (!liveEvent) {
    return createNoStorePhotosResponse([], 404);
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

  const supabase = createPublicSupabaseClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,photo_limit")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    console.error("Failed to load upload event by slug", {
      slug,
      message: eventError.message,
    });
    return NextResponse.json({ error: "Не удалось найти мероприятие" }, { status: 500 });
  }

  const uploadEvent = event as { id: string; photo_limit: number } | null;

  if (!uploadEvent) {
    return NextResponse.json({ error: "Мероприятие не найдено" }, { status: 404 });
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

  if ((count ?? 0) >= uploadEvent.photo_limit) {
    return NextResponse.json({ error: "Лимит фото для этого мероприятия уже достигнут" }, { status: 400 });
  }

  if ((count ?? 0) + files.length > uploadEvent.photo_limit) {
    return NextResponse.json(
      { error: `Можно добавить ещё ${Math.max(0, uploadEvent.photo_limit - (count ?? 0))} фото` },
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
      } as any)
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

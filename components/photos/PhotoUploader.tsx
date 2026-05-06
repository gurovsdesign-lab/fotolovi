"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
  PHOTO_BUCKET,
} from "@/lib/constants";
import { getFileExtension } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import type { Database } from "@/types/database";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type EventId = Database["public"]["Tables"]["events"]["Row"]["id"];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_UPLOAD_IMAGE_EDGE = 1920;
const UPLOAD_JPEG_QUALITY = 0.82;

export function PhotoUploader({
  eventId,
  photoLimit,
  currentCount,
}: {
  eventId: EventId;
  photoLimit: number;
  currentCount: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(file?: File) {
    if (!file) {
      setStatus("error");
      setMessage("Выберите фото для загрузки");
      return;
    }

    if (file.type && !file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Можно загружать только изображения");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setStatus("error");
      setMessage(`Файл слишком большой. Максимум ${MAX_UPLOAD_SIZE_MB} МБ`);
      return;
    }

    if (!UUID_PATTERN.test(eventId)) {
      setStatus("error");
      setMessage("Не удалось определить мероприятие для загрузки");
      return;
    }

    if (currentCount >= photoLimit) {
      setStatus("error");
      setMessage("Лимит фото для этого мероприятия уже достигнут");
      return;
    }

    setStatus("uploading");
    setMessage("Готовим фото...");

    const supabase = createClient();
    const uploadFile = await prepareImageForUpload(file);
    const extension = getFileExtension(uploadFile);

    const random =
     typeof crypto !== "undefined" && crypto.randomUUID
     ? crypto.randomUUID()
     : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const storagePath = `${eventId}/${Date.now()}-${random}.${extension}`;
    console.log("PHOTO UPLOAD BEFORE", {
      bucket: PHOTO_BUCKET,
      eventId,
      storagePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadType: uploadFile.type,
      uploadSize: uploadFile.size,
    });

    setMessage("Загружаем фото...");

    const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(
      storagePath,
      uploadFile,
      {
        cacheControl: "3600",
        contentType: uploadFile.type || "image/jpeg",
        upsert: false,
      },
    );

    if (uploadError) {
      console.log("UPLOAD ERROR FULL:", JSON.stringify(uploadError));
      console.log("UPLOAD ERROR MESSAGE:", uploadError?.message);
      setStatus("error");
      setMessage("Не удалось загрузить фото. Попробуйте ещё раз");
      return;
    }

    console.log("UPLOAD SUCCESS", storagePath);

    const { data: publicData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
    const publicUrl = publicData.publicUrl;
    const insertPayload = {
      event_id: eventId,
      storage_path: storagePath,
      public_url: publicUrl,
    };

    console.log("EVENT ID =", eventId);
    console.log("PHOTO INSERT BEFORE");
    console.log("PHOTO INSERT PAYLOAD", insertPayload);

    const { data: insertData, error: insertError } = await supabase.from("photos").insert(insertPayload as any)

    console.log("PHOTO INSERT RESULT", insertData);
    console.log("PHOTO INSERT ERROR", insertError);

    if (insertError) {
      console.log("INSERT ERROR FULL:", JSON.stringify(insertError));
      console.log("INSERT ERROR MESSAGE:", insertError?.message);
      console.log("INSERT ERROR DETAILS:", insertError?.details);
      console.log("INSERT ERROR CODE:", insertError?.code);
    
      await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    
      setStatus("error");
      setMessage("Не удалось сохранить фото. Попробуйте ещё раз");
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    setStatus("success");
    setMessage("Спасибо! Ваш снимок добавлен в альбом");
    startTransition(() => router.refresh());
  }

  const disabled = status === "uploading" || isPending;

  return (
    <div className="rounded-2xl border border-dashed border-action/25 bg-white p-5 shadow-soft">
      <div className="grid gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Добавьте фото в общий альбом</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ваши снимки появятся в галерее и на экране мероприятия.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} className="h-14 text-base">
          {disabled ? <Loader /> : <Camera className="size-5" />}
          {disabled ? "Загружаем..." : "Выбрать фото"}
        </Button>
        <p className="flex items-center gap-2 text-xs text-muted">
          <UploadCloud className="size-4" />
          До {MAX_UPLOAD_SIZE_MB} МБ, JPG/PNG/WEBP/HEIC.
        </p>
        {message ? (
          <p className={status === "error" ? "text-sm text-red-600" : "text-sm text-green-700"}>
            {status === "success" ? "Фото загружено. " : ""}
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

async function prepareImageForUpload(file: File) {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_UPLOAD_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", UPLOAD_JPEG_QUALITY);
    });

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], replaceFileExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.log("IMAGE PREPARE FALLBACK:", error);
    return file;
  }
}

function replaceFileExtension(name: string, extension: string) {
  const safeName = name.trim() || "photo";
  return safeName.includes(".")
    ? safeName.replace(/\.[^.]+$/, `.${extension}`)
    : `${safeName}.${extension}`;
}

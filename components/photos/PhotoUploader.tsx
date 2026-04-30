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
    setMessage("Загружаем фото...");

    const supabase = createClient();
    const extension = getFileExtension(file);

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
    });

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
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

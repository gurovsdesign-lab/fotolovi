"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { PhotoCard } from "./PhotoCard";
import type { Photo } from "@/types/photo";

type DownloadState =
  | { status: "idle" }
  | { status: "loading"; current: number; total: number }
  | { status: "error"; message: string };

const ZIP_BATCH_PAUSE_MS = 25;
const ZIP_BATCH_SIZE = 5;

export function PhotoGrid({
  photos,
  eventId,
  eventTitle,
  canManage = false,
}: {
  photos: Photo[];
  eventId: string;
  eventTitle: string;
  canManage?: boolean;
}) {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [singleDownloadId, setSingleDownloadId] = useState<string | null>(null);

  useEffect(() => {
    if (!previewPhoto) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewPhoto(null);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewPhoto]);

  if (!photos.length) {
    return (
      <EmptyState
        title="Пока нет фото"
        description="Когда гости загрузят первые снимки, они появятся здесь и на live screen."
      />
    );
  }

  async function downloadSinglePhoto(photo: Photo) {
    if (singleDownloadId) return;

    setSingleDownloadId(photo.id);

    try {
      const blob = await fetchPhotoBlob(photo.public_url);
      downloadBlob(blob, createPhotoFilename(photo, eventTitle, photos.indexOf(photo)));
    } catch (error) {
      console.error("Failed to download photo", error);
    } finally {
      setSingleDownloadId(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            eventId={eventId}
            canManage={canManage}
            onPreview={() => setPreviewPhoto(photo)}
          />
        ))}
      </div>

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/[0.88] px-4 py-[max(1rem,env(safe-area-inset-top))] text-white backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 inline-flex size-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewPhoto(null);
            }}
            aria-label="Закрыть фото"
          >
            <X className="size-5" />
          </button>

          <figure
            className="grid max-h-full w-full max-w-5xl animate-[preview-in_180ms_ease-out] gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid max-h-[calc(100vh-9rem)] place-items-center overflow-hidden rounded-xl">
              <img
                src={previewPhoto.public_url}
                alt="Фото мероприятия"
                className="max-h-[calc(100vh-9rem)] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
            <button
              type="button"
              className={cn(
                "mx-auto inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-white/90",
                singleDownloadId ? "cursor-not-allowed opacity-70" : "",
              )}
              disabled={singleDownloadId !== null}
              onClick={() => downloadSinglePhoto(previewPhoto)}
            >
              {singleDownloadId === previewPhoto.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Скачать фото
            </button>
          </figure>
        </div>
      ) : null}
    </>
  );
}

export function PhotoDownloadAllButton({
  photos,
  eventTitle,
  className,
}: {
  photos: Photo[];
  eventTitle: string;
  className?: string;
}) {
  const [downloadAllState, setDownloadAllState] = useState<DownloadState>({ status: "idle" });
  const downloadablePhotos = useMemo(
    () => photos.filter((photo) => !photo.is_hidden),
    [photos],
  );
  const isDownloadingAll = downloadAllState.status === "loading";

  async function downloadAllPhotos() {
    if (!downloadablePhotos.length || isDownloadingAll) return;

    setDownloadAllState({
      status: "loading",
      current: 0,
      total: downloadablePhotos.length,
    });

    try {
      const zipBlob = await createPhotoZip(downloadablePhotos, eventTitle, (current, total) => {
        setDownloadAllState({ status: "loading", current, total });
      });
      downloadBlob(zipBlob, `${createSafeFilename(eventTitle)}-photos.zip`);
      setDownloadAllState({ status: "idle" });
    } catch (error) {
      console.error("Failed to download event photos zip", error);
      setDownloadAllState({
        status: "error",
        message: "Не удалось подготовить архив. Попробуйте ещё раз",
      });
    }
  }

  return (
    <div className={cn("grid gap-1", className)}>
      <button
        type="button"
        onClick={downloadAllPhotos}
        disabled={!downloadablePhotos.length || isDownloadingAll}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-ink shadow-sm transition hover:border-action/30 hover:text-action disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
      >
        {isDownloadingAll ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {isDownloadingAll ? "Готовим архив..." : "Скачать все фото"}
      </button>
      {downloadAllState.status === "loading" ? (
        <p className="text-center text-xs text-muted sm:text-right">
          {downloadAllState.current} из {downloadAllState.total}
        </p>
      ) : null}
      {downloadAllState.status === "error" ? (
        <p className="text-center text-xs text-red-600 sm:text-right">{downloadAllState.message}</p>
      ) : null}
    </div>
  );
}

async function createPhotoZip(
  photos: Photo[],
  eventTitle: string,
  onProgress: (current: number, total: number) => void,
) {
  const parts: BlobPart[] = [];
  const centralDirectory: BlobPart[] = [];
  let offset = 0;

  for (const [index, photo] of photos.entries()) {
    const blob = await fetchPhotoBlob(photo.public_url);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const filename = createPhotoFilename(photo, eventTitle, index);
    const filenameBytes = new TextEncoder().encode(filename);
    const crc = crc32(bytes);
    const localHeader = createZipLocalHeader(filenameBytes, crc, bytes.byteLength);

    parts.push(localHeader, bytes);
    centralDirectory.push(createZipCentralDirectoryHeader(filenameBytes, crc, bytes.byteLength, offset));
    offset += localHeader.byteLength + bytes.byteLength;
    onProgress(index + 1, photos.length);

    if ((index + 1) % ZIP_BATCH_SIZE === 0) {
      await wait(ZIP_BATCH_PAUSE_MS);
    }
  }

  const centralDirectorySize = centralDirectory.reduce((size, part) => size + getBlobPartSize(part), 0);
  const centralDirectoryOffset = offset;
  const endRecord = createZipEndRecord(photos.length, centralDirectorySize, centralDirectoryOffset);

  return new Blob([...parts, ...centralDirectory, endRecord], { type: "application/zip" });
}

async function fetchPhotoBlob(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch photo: ${response.status}`);
  return response.blob();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function createPhotoFilename(photo: Photo, eventTitle: string, index: number) {
  const extension = getPhotoExtension(photo.storage_path || photo.public_url);
  return `${createSafeFilename(eventTitle)}-${String(index + 1).padStart(3, "0")}.${extension}`;
}

function createSafeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";
}

function getPhotoExtension(value: string) {
  const clean = value.split("?")[0] || "";
  const extension = clean.split(".").pop()?.toLowerCase();
  if (!extension || extension.length > 5) return "jpg";
  if (extension === "jpeg") return "jpg";
  return extension;
}

function createZipLocalHeader(filenameBytes: Uint8Array, crc: number, size: number) {
  const header = new ArrayBuffer(30 + filenameBytes.byteLength);
  const view = new DataView(header);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, filenameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  new Uint8Array(header, 30).set(filenameBytes);
  return header;
}

function createZipCentralDirectoryHeader(
  filenameBytes: Uint8Array,
  crc: number,
  size: number,
  localHeaderOffset: number,
) {
  const header = new ArrayBuffer(46 + filenameBytes.byteLength);
  const view = new DataView(header);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, filenameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  new Uint8Array(header, 46).set(filenameBytes);
  return header;
}

function createZipEndRecord(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const record = new ArrayBuffer(22);
  const view = new DataView(record);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  return record;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function getBlobPartSize(part: BlobPart) {
  if (part instanceof ArrayBuffer) return part.byteLength;
  if (ArrayBuffer.isView(part)) return part.byteLength;
  if (part instanceof Blob) return part.size;
  return new Blob([part]).size;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PhotoDownloadAllButton, PhotoGrid } from "@/components/photos/PhotoGrid";
import { Button } from "@/components/ui/Button";
import type { DashboardPhoto, Photo } from "@/types/photo";

export function EventGallery({
  photos,
  eventId,
  eventTitle,
  allowDownloadAll = true,
}: {
  photos: Photo[];
  eventId: string;
  eventTitle: string;
  allowDownloadAll?: boolean;
}) {
  const [displayPhotos, setDisplayPhotos] = useState<DashboardPhoto[]>(photos);
  const activePhotos = displayPhotos.filter((photo) => photo.dashboard_state !== "deleted");
  const visibleCount = activePhotos.filter((photo) => !photo.is_hidden).length;
  const hiddenCount = activePhotos.length - visibleCount;
  const latestUploadedAt = getLatestUploadedAt(photos);

  useEffect(() => {
    setDisplayPhotos(photos);
  }, [photos]);

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Галерея</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Фото гостей</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
          <span className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm text-muted shadow-sm">
            На экране: {visibleCount} фото
          </span>
          <span className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm text-muted shadow-sm">
            Скрыто: {hiddenCount} фото
          </span>
          {allowDownloadAll ? (
            <PhotoDownloadAllButton photos={activePhotos} eventTitle={eventTitle} className="sm:items-end" />
          ) : null}
        </div>
      </div>
      <PhotoGrid
        photos={displayPhotos}
        eventId={eventId}
        eventTitle={eventTitle}
        canManage
        onPhotosChange={setDisplayPhotos}
      />
      <NewPhotosRefreshNotice eventId={eventId} latestUploadedAt={latestUploadedAt} />
    </section>
  );
}

function NewPhotosRefreshNotice({
  eventId,
  latestUploadedAt,
}: {
  eventId: string;
  latestUploadedAt: string | null;
}) {
  const [newPhotosCount, setNewPhotosCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadNewPhotoCount() {
      try {
        const params = new URLSearchParams();
        if (latestUploadedAt) {
          params.set("since", latestUploadedAt);
        }

        const response = await fetch(`/api/dashboard/events/${eventId}/new-photos?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { count?: number };
        if (isMounted) {
          setNewPhotosCount(payload.count ?? 0);
        }
      } catch (error) {
        console.error("Failed to poll new photo count", error);
      }
    }

    setNewPhotosCount(0);
    const interval = window.setInterval(loadNewPhotoCount, 7000);
    loadNewPhotoCount();

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [eventId, latestUploadedAt]);

  if (newPhotosCount < 1) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-soft sm:flex-nowrap">
      <span>Добавлено {newPhotosCount} новых фотографий</span>
      <Button type="button" variant="secondary" className="h-9 shrink-0 whitespace-nowrap px-4" onClick={() => window.location.reload()}>
        <RefreshCw className="size-4" />
        Обновить страницу
      </Button>
    </div>
  );
}

function getLatestUploadedAt(photos: Photo[]) {
  return photos.reduce<string | null>((latest, photo) => {
    if (!photo.uploaded_at) return latest;
    if (!latest || photo.uploaded_at > latest) return photo.uploaded_at;
    return latest;
  }, null);
}

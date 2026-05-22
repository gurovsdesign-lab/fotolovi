"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { PhotoDownloadAllButton, PhotoGrid } from "@/components/photos/PhotoGrid";
import { Button } from "@/components/ui/Button";
import type { Photo } from "@/types/photo";

export function EventGallery({
  photos,
  eventId,
  eventTitle,
  allowDownloadAll = true,
  isPremoderation = false,
}: {
  photos: Photo[];
  eventId: string;
  eventTitle: string;
  allowDownloadAll?: boolean;
  isPremoderation?: boolean;
}) {
  const [displayPhotos, setDisplayPhotos] = useState(photos);
  const initialHiddenCount = photos.filter((photo) => photo.is_hidden).length;

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
            {displayPhotos.length} фото
          </span>
          {allowDownloadAll ? (
            <PhotoDownloadAllButton photos={displayPhotos} eventTitle={eventTitle} className="sm:items-end" />
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
      {isPremoderation ? <PremoderationRefreshNotice eventId={eventId} initialHiddenCount={initialHiddenCount} /> : null}
    </section>
  );
}

function PremoderationRefreshNotice({
  eventId,
  initialHiddenCount,
}: {
  eventId: string;
  initialHiddenCount: number;
}) {
  const router = useRouter();
  const [hiddenCount, setHiddenCount] = useState(initialHiddenCount);
  const newPhotosCount = Math.max(0, hiddenCount - initialHiddenCount);

  useEffect(() => {
    let isMounted = true;

    async function loadHiddenCount() {
      try {
        const response = await fetch(`/api/dashboard/events/${eventId}/hidden-photos`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { count?: number };
        if (isMounted) {
          setHiddenCount(payload.count ?? initialHiddenCount);
        }
      } catch (error) {
        console.error("Failed to poll hidden photo count", error);
      }
    }

    const interval = window.setInterval(loadHiddenCount, 7000);
    loadHiddenCount();

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [eventId, initialHiddenCount]);

  if (newPhotosCount < 1) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-soft">
      <span>Добавлено {newPhotosCount} новых фотографий</span>
      <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => router.refresh()}>
        <RefreshCw className="size-4" />
        Обновить страницу
      </Button>
    </div>
  );
}

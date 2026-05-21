import { PhotoDownloadAllButton, PhotoGrid } from "@/components/photos/PhotoGrid";
import type { Photo } from "@/types/photo";

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
  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Галерея</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Фото гостей</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
          <span className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm text-muted shadow-sm">
            {photos.length} фото
          </span>
          {allowDownloadAll ? (
            <PhotoDownloadAllButton photos={photos} eventTitle={eventTitle} className="sm:items-end" />
          ) : null}
        </div>
      </div>
      <PhotoGrid photos={photos} eventId={eventId} eventTitle={eventTitle} canManage />
    </section>
  );
}

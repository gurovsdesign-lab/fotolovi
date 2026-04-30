import { PhotoGrid } from "@/components/photos/PhotoGrid";
import type { Photo } from "@/types/photo";

export function EventGallery({ photos, eventId }: { photos: Photo[]; eventId: string }) {
  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Галерея</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Фото гостей</h2>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm text-muted shadow-sm">
          {photos.length} фото
        </span>
      </div>
      <PhotoGrid photos={photos} eventId={eventId} canManage />
    </section>
  );
}

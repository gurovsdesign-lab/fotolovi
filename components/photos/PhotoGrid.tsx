import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoCard } from "./PhotoCard";
import type { Photo } from "@/types/photo";

export function PhotoGrid({ photos, eventId, canManage = false }: { photos: Photo[]; eventId: string; canManage?: boolean }) {
  if (!photos.length) {
    return (
      <EmptyState
        title="Пока нет фото"
        description="Когда гости загрузят первые снимки, они появятся здесь и на live screen."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} eventId={eventId} canManage={canManage} />
      ))}
    </div>
  );
}

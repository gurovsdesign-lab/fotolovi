import Image from "next/image";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deletePhotoAction, togglePhotoVisibilityAction } from "@/features/photos/actions";
import type { Photo } from "@/types/photo";

export function PhotoCard({ photo, eventId, canManage = false }: { photo: Photo; eventId: string; canManage?: boolean }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="relative aspect-[4/5] bg-ivory">
        <Image src={photo.public_url} alt="Фото мероприятия" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        {photo.is_hidden ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-medium text-white">
            Скрыто
          </div>
        ) : null}
      </div>
      {canManage ? (
        <div className="flex gap-2 p-3">
          <form action={togglePhotoVisibilityAction} className="flex-1">
            <input type="hidden" name="photoId" value={photo.id} />
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="isHidden" value={String(photo.is_hidden)} />
            <Button type="submit" variant="secondary" className="h-10 w-full px-3">
              {photo.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>
          </form>
          <form action={deletePhotoAction}>
            <input type="hidden" name="photoId" value={photo.id} />
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="storagePath" value={photo.storage_path} />
            <Button type="submit" variant="danger" className="h-10 px-3">
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

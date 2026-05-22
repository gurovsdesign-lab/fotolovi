import Image from "next/image";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Photo } from "@/types/photo";

export function PhotoCard({
  photo,
  canManage = false,
  onPreview,
  onDelete,
  onToggleVisibility,
  isActionPending = false,
}: {
  photo: Photo;
  canManage?: boolean;
  onPreview?: () => void;
  onDelete?: (photo: Photo) => void;
  onToggleVisibility?: (photo: Photo) => void;
  isActionPending?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <button
        type="button"
        className="relative block aspect-[4/5] w-full bg-ivory text-left"
        onClick={onPreview}
        aria-label="Открыть фото"
      >
        <Image src={photo.public_url} alt="Фото мероприятия" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        {photo.is_hidden ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-medium text-white">
            Скрыто
          </div>
        ) : null}
      </button>
      {canManage ? (
        <div className="flex gap-2 p-3">
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full flex-1 px-3"
            disabled={isActionPending}
            onClick={() => onToggleVisibility?.(photo)}
            aria-label={photo.is_hidden ? "Показать фото" : "Скрыть фото"}
          >
            {photo.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="h-10 px-3"
            disabled={isActionPending}
            onClick={() => onDelete?.(photo)}
            aria-label="Удалить фото"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

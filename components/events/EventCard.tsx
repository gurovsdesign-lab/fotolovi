import Link from "next/link";
import { CalendarDays, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { EventWithPhotoCount } from "@/types/event";

export function EventCard({ event }: { event: EventWithPhotoCount }) {
  return (
    <Link href={`/dashboard/events/${event.id}`} className="block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-action/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              {event.is_paid ? "Premium" : "Test"}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{event.title}</h3>
          </div>
          <span className="rounded-full bg-ivory px-3 py-1 text-xs text-muted">
            {event.photo_limit} фото
          </span>
        </div>
        <div className="mt-6 grid gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDate(event.event_date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <ImageIcon className="size-4" />
            {event.photos_count} фото загружено
          </span>
        </div>
      </Card>
    </Link>
  );
}

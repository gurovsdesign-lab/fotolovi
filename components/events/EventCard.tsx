import Link from "next/link";
import { CalendarDays, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EventStatusBadge, EventTypeBadge, eventPillClassName } from "@/components/events/EventStatusBadge";
import { getEventStatus } from "@/lib/eventStatus";
import { formatDate } from "@/lib/utils";
import type { EventWithPhotoCount } from "@/types/event";

export function EventCard({ event }: { event: EventWithPhotoCount }) {
  const eventStatus = getEventStatus(event.event_date);

  return (
    <Link href={`/dashboard/events/${event.id}`} className="block">
      <Card className="flex h-full flex-col transition hover:-translate-y-0.5 hover:border-action/20">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-4">
            <EventTypeBadge isPaid={event.is_paid} />
            <span className={`${eventPillClassName} shrink-0 whitespace-nowrap bg-ivory text-muted`}>
              Лимит: {event.photo_limit} фото
            </span>
          </div>
          <h3 className="text-xl font-semibold text-ink">{event.title}</h3>
        </div>
        <div className="mt-auto grid gap-3 pt-6 text-sm text-muted">
          <span className="inline-flex flex-wrap items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDate(event.event_date)}
            <span className="text-muted/60">•</span>
            <EventStatusBadge status={eventStatus} />
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

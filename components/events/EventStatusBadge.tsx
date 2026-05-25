import {
  getEventStatusDescription,
  getEventStatusLabel,
  type EventStatus,
} from "@/lib/eventStatus";
import { cn } from "@/lib/utils";

export const eventPillClassName = "inline-flex h-8 w-max items-center rounded-full px-3 text-xs font-medium";

export function EventStatusBadge({
  status,
  descriptive = false,
}: {
  status: EventStatus;
  descriptive?: boolean;
}) {
  return (
    <span
      className={cn(
        eventPillClassName,
        status === "current" && "bg-action text-white shadow-sm",
        status === "planned" && "bg-ivory text-ink",
        (status === "recent" || status === "storage" || status === "completed") && "bg-ivory text-muted",
      )}
    >
      {descriptive ? getEventStatusDescription(status) : getEventStatusLabel(status)}
    </span>
  );
}

export function EventTypeBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-[0.18em]",
        isPaid ? "text-gold" : "text-stone-500",
      )}
    >
      {isPaid ? "Premium" : "Тест"}
    </span>
  );
}

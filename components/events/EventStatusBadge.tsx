import {
  getEventStatusBadgeClassName,
  getEventStatusDescription,
  getEventStatusLabel,
  type EventStatus,
} from "@/lib/eventStatus";

export function EventStatusBadge({
  status,
  descriptive = false,
}: {
  status: EventStatus;
  descriptive?: boolean;
}) {
  return (
    <span className={getEventStatusBadgeClassName(status)}>
      {descriptive ? getEventStatusDescription(status) : getEventStatusLabel(status)}
    </span>
  );
}

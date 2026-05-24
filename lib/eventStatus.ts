import { getTodayDateString } from "@/lib/eventSettings";
import { cn } from "@/lib/utils";

export type EventStatus = "planned" | "current" | "past";

export function getEventStatus(eventDate: string, today = getTodayDateString()): EventStatus {
  if (eventDate < today) return "past";
  if (eventDate === today) return "current";
  return "planned";
}

export function getEventStatusLabel(status: EventStatus) {
  if (status === "current") return "Текущее";
  if (status === "past") return "Прошедшее";
  return "Запланировано";
}

export function getEventStatusDescription(status: EventStatus) {
  if (status === "current") return "Текущее мероприятие";
  if (status === "past") return "Прошедшее мероприятие";
  return "Запланированное мероприятие";
}

export function getEventStatusBadgeClassName(status: EventStatus) {
  return cn(
    "inline-flex h-8 w-max items-center rounded-full px-3 text-xs font-medium",
    status === "current" && "bg-action text-white shadow-sm",
    status === "planned" && "bg-ivory text-ink",
    status === "past" && "bg-black/5 text-muted",
  );
}

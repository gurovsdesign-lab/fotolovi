import { getTodayDateString } from "@/lib/eventSettings";

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

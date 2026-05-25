import { getTodayDateString } from "@/lib/eventSettings";
import { formatDate } from "@/lib/utils";

const RECENT_DAYS = 2;
const STORAGE_DAYS = 7;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

export type EventStatus = "planned" | "current" | "recent" | "storage" | "completed";

export type EventLifecycle = {
  status: EventStatus;
  eventDate: string;
  today: string;
  uploadDeadlineDate: string;
  storageDeadlineDate: string;
  permissions: {
    canUpload: boolean;
    canViewGallery: boolean;
    canDownload: boolean;
    canUseLiveScreen: boolean;
    canShowLivePhotos: boolean;
  };
};

export function getEventLifecycle(eventDate: string, today = getTodayDateString()): EventLifecycle {
  const daysAfterEvent = getDateDifferenceInDays(today, eventDate);
  const uploadDeadlineDate = addDaysToDateString(eventDate, RECENT_DAYS);
  const storageDeadlineDate = addDaysToDateString(eventDate, RECENT_DAYS + STORAGE_DAYS);
  const status = getStatusFromDaysAfterEvent(daysAfterEvent);

  return {
    status,
    eventDate,
    today,
    uploadDeadlineDate,
    storageDeadlineDate,
    permissions: getLifecyclePermissions(status),
  };
}

export function getEventStatus(eventDate: string, today = getTodayDateString()): EventStatus {
  return getEventLifecycle(eventDate, today).status;
}

export function getEventStatusLabel(status: EventStatus) {
  if (status === "current") return "Текущее";
  if (status === "recent") return "Недавнее";
  if (status === "storage") return "Хранение";
  if (status === "completed") return "Завершенное";
  return "Запланированное";
}

export function getEventStatusDescription(status: EventStatus) {
  if (status === "current") return "Текущее мероприятие";
  if (status === "recent") return "Недавнее мероприятие";
  if (status === "storage") return "Мероприятие на хранении";
  if (status === "completed") return "Завершенное мероприятие";
  return "Запланированное мероприятие";
}

export function getDashboardLifecycleMessage(lifecycle: EventLifecycle) {
  if (lifecycle.status === "recent") {
    return `Мероприятие завершено. Загружать фотографии можно до ${formatDate(lifecycle.uploadDeadlineDate)}, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)}.`;
  }

  if (lifecycle.status === "storage") {
    return `Загрузка уже завершена. Фотографии доступны для скачивания до ${formatDate(lifecycle.storageDeadlineDate)}.`;
  }

  if (lifecycle.status === "completed") {
    return "Срок хранения фотографий истёк. Мероприятие полностью завершено.";
  }

  return null;
}

export function getGuestLifecycleMessage(lifecycle: EventLifecycle) {
  if (lifecycle.status === "planned") {
    return "Мероприятие ещё не началось. Загрузка, просмотр и скачивание будут доступны в день мероприятия.";
  }

  return getDashboardLifecycleMessage(lifecycle);
}

export function getLiveLifecycleMessage(lifecycle: EventLifecycle) {
  if (lifecycle.status === "recent") {
    return `Мероприятие завершено. Вы можете загружать фотографии до ${formatDate(lifecycle.uploadDeadlineDate)}, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)}.`;
  }

  if (lifecycle.status === "planned") {
    return "Мероприятие ещё не началось. Live screen станет доступен в день мероприятия.";
  }

  if (lifecycle.status === "storage") {
    return `Live screen уже завершён. Фотографии доступны для скачивания до ${formatDate(lifecycle.storageDeadlineDate)}.`;
  }

  if (lifecycle.status === "completed") {
    return "Срок хранения фотографий истёк. Мероприятие полностью завершено.";
  }

  return null;
}

export function isEventDateEditable(lifecycle: EventLifecycle) {
  return lifecycle.status === "planned" || lifecycle.status === "current";
}

function getStatusFromDaysAfterEvent(daysAfterEvent: number): EventStatus {
  if (daysAfterEvent < 0) return "planned";
  if (daysAfterEvent === 0) return "current";
  if (daysAfterEvent <= RECENT_DAYS) return "recent";
  if (daysAfterEvent <= RECENT_DAYS + STORAGE_DAYS) return "storage";
  return "completed";
}

function getLifecyclePermissions(status: EventStatus): EventLifecycle["permissions"] {
  return {
    canUpload: status === "current" || status === "recent",
    canViewGallery: status === "current" || status === "recent" || status === "storage",
    canDownload: status === "current" || status === "recent" || status === "storage",
    canUseLiveScreen: status === "current" || status === "recent",
    canShowLivePhotos: status === "current",
  };
}

function getDateDifferenceInDays(firstDate: string, secondDate: string) {
  return Math.floor((getDateUtcTime(firstDate) - getDateUtcTime(secondDate)) / MILLISECONDS_IN_DAY);
}

function addDaysToDateString(value: string, days: number) {
  const date = new Date(getDateUtcTime(value));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDateUtcTime(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

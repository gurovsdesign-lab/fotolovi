import { getTodayDateString } from "@/lib/eventSettings";
import { formatDate } from "@/lib/utils";

const RECENT_DAYS = 2;
const STORAGE_DAYS = 7;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const CURRENT_STATUS_END_HOUR_MSK = 10;
const MOSCOW_TIME_ZONE = "Europe/Moscow";

export type EventStatus = "planned" | "current" | "recent" | "storage" | "completed";

export type EventLifecycle = {
  status: EventStatus;
  eventDate: string;
  today: string;
  livePhotosDeadlineDate: string;
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

export function getEventLifecycle(eventDate: string, now: Date | string = new Date()): EventLifecycle {
  const moscowNow = getMoscowDateTimeParts(now);
  const daysAfterEvent = getDateDifferenceInDays(moscowNow.date, eventDate);
  const livePhotosDeadlineDate = addDaysToDateString(eventDate, 1);
  const uploadDeadlineDate = addDaysToDateString(eventDate, RECENT_DAYS);
  const storageDeadlineDate = addDaysToDateString(eventDate, RECENT_DAYS + STORAGE_DAYS);
  const status = getStatusFromMoscowTime(daysAfterEvent, moscowNow.hour);

  return {
    status,
    eventDate,
    today: moscowNow.date,
    livePhotosDeadlineDate,
    uploadDeadlineDate,
    storageDeadlineDate,
    permissions: getLifecyclePermissions(status),
  };
}

export function getEventStatus(eventDate: string, now: Date | string = new Date()): EventStatus {
  return getEventLifecycle(eventDate, now).status;
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
  if (lifecycle.status === "planned") {
    return `Мероприятие ещё не началось. Показ фотографий на экране будет доступен до ${formatDate(lifecycle.livePhotosDeadlineDate)} 10:00 по МСК. Загружать фотографии можно до ${formatDate(lifecycle.uploadDeadlineDate)} включительно, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)} включительно.`;
  }

  if (lifecycle.status === "current") {
    return `Мероприятие идёт. Показ фотографий на экране будет доступен до ${formatDate(lifecycle.livePhotosDeadlineDate)} 10:00 по МСК. Загружать фотографии можно до ${formatDate(lifecycle.uploadDeadlineDate)} включительно, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)} включительно.`;
  }

  if (lifecycle.status === "recent") {
    return `Мероприятие завершено. Загружать фотографии можно до ${formatDate(lifecycle.uploadDeadlineDate)} включительно, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)} включительно.`;
  }

  if (lifecycle.status === "storage") {
    return `Загрузка уже завершена. Фотографии доступны для скачивания до ${formatDate(lifecycle.storageDeadlineDate)} включительно.`;
  }

  if (lifecycle.status === "completed") {
    return "Срок хранения фотографий истёк. Мероприятие полностью завершено.";
  }

  return null;
}

export function getGuestLifecycleMessage(lifecycle: EventLifecycle) {
  if (lifecycle.status === "planned") {
    return null;
  }

  return getDashboardLifecycleMessage(lifecycle);
}

export function getLiveLifecycleMessage(lifecycle: EventLifecycle) {
  if (lifecycle.status === "recent") {
    return `Мероприятие завершено. Вы можете загружать фотографии до ${formatDate(lifecycle.uploadDeadlineDate)} включительно, а фотографии будут храниться до ${formatDate(lifecycle.storageDeadlineDate)} включительно.`;
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

function getStatusFromMoscowTime(daysAfterEvent: number, hour: number): EventStatus {
  if (daysAfterEvent < 0) return "planned";
  if (daysAfterEvent === 0 || (daysAfterEvent === 1 && hour < CURRENT_STATUS_END_HOUR_MSK)) {
    return "current";
  }
  if (daysAfterEvent <= RECENT_DAYS) return "recent";
  if (daysAfterEvent <= RECENT_DAYS + STORAGE_DAYS) return "storage";
  return "completed";
}

function getLifecyclePermissions(status: EventStatus): EventLifecycle["permissions"] {
  return {
    canUpload: status === "planned" || status === "current" || status === "recent",
    canViewGallery: status === "planned" || status === "current" || status === "recent" || status === "storage",
    canDownload: status === "planned" || status === "current" || status === "recent" || status === "storage",
    canUseLiveScreen: status === "planned" || status === "current" || status === "recent",
    canShowLivePhotos: status === "planned" || status === "current",
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

function getMoscowDateTimeParts(now: Date | string) {
  if (typeof now === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(now)) {
      return { date: now, hour: 12 };
    }

    return getMoscowDateTimeParts(new Date(now));
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MOSCOW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 12);

  if (!year || !month || !day) {
    return { date: getTodayDateString(), hour };
  }

  return { date: `${year}-${month}-${day}`, hour };
}

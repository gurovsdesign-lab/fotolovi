export const APP_TIME_ZONE = "Europe/Moscow";
export const DEFAULT_GUEST_ACCESS_MODE = "upload_view_download";
export const DEFAULT_MODERATION_MODE = "show_immediately";

export const guestAccessModes = ["upload_only", "upload_view", "upload_view_download"] as const;
export const moderationModes = ["show_immediately", "premoderation"] as const;

export type GuestAccessMode = (typeof guestAccessModes)[number];
export type ModerationMode = (typeof moderationModes)[number];

export function isGuestAccessMode(value: string): value is GuestAccessMode {
  return guestAccessModes.includes(value as GuestAccessMode);
}

export function isModerationMode(value: string): value is ModerationMode {
  return moderationModes.includes(value as ModerationMode);
}

export function normalizeGuestAccessMode(value: string | null | undefined): GuestAccessMode {
  return value && isGuestAccessMode(value) ? value : DEFAULT_GUEST_ACCESS_MODE;
}

export function normalizeModerationMode(value: string | null | undefined): ModerationMode {
  return value && isModerationMode(value) ? value : DEFAULT_MODERATION_MODE;
}

export function getTodayDateString(timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return new Date().toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

export function isPastEventDate(eventDate: string, today = getTodayDateString()) {
  return eventDate < today;
}

export function createGuestAccessCookieName(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 90);
  return `fotolovi_guest_${safeSlug}`;
}

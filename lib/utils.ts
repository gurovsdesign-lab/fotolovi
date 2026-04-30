import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const LOCAL_NETWORK_ORIGIN = "http://192.168.3.112:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Дата не указана";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function createSlug(title: string) {
  const normalized = transliterateCyrillic(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized || "event"}-${suffix}`;
}

function transliterateCyrillic(value: string) {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return value.replace(/[а-яё]/gi, (char) => map[char.toLowerCase()] ?? "");
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (typeof window !== "undefined" && !isLocalhostOrigin(window.location.origin)) {
    return window.location.origin;
  }

  return LOCAL_NETWORK_ORIGIN;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

function isLocalhostOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin);
}

export function getFileExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension) return nameExtension === "jpeg" ? "jpg" : nameExtension;

  const [, mimeExtension] = file.type.split("/");
  return mimeExtension || "jpg";
}

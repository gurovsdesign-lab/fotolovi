import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const LOCAL_NETWORK_ORIGIN = "http://192.168.3.112:3000";
const PRODUCTION_ORIGIN = "https://www.fotolovi.ru";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Дата не указана";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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
  if (process.env.VERCEL_URL) return PRODUCTION_ORIGIN;

  if (typeof window !== "undefined" && !isLocalhostOrigin(window.location.origin)) {
    if (isVercelOrigin(window.location.origin)) return PRODUCTION_ORIGIN;
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

function isVercelOrigin(origin: string) {
  return /^https:\/\/[^/]+\.vercel\.app$/i.test(origin);
}

export function getFileExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension) return nameExtension === "jpeg" ? "jpg" : nameExtension;

  const [, mimeExtension] = file.type.split("/");
  return mimeExtension || "jpg";
}

import type { PremiumPackage } from "@/lib/premiumPackages";

export const LEGAL_RETURN_URL_KEY = "fotolovi:legal-return-url";
export const AUTH_DRAFT_KEY_PREFIX = "fotolovi:auth-draft:";
export const PREMIUM_CONTACT_DRAFT_KEY = "fotolovi:premium-contact-draft";

export type AuthDraft = {
  fullName?: string;
  email?: string;
  personalDataAgreement?: boolean;
};

export type PremiumContactSource = "balance" | "create-event";

export type PremiumContactDraft = {
  isOpen: boolean;
  source: PremiumContactSource;
  packageId: PremiumPackage["id"];
  preferredCommunication: string;
  contact: string;
  comment: string;
  personalDataAgreement: boolean;
};

export function readSessionJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function writeSessionJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionValue(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}

export function rememberLegalReturnUrl(path: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LEGAL_RETURN_URL_KEY, path);
}

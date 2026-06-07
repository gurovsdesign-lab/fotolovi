"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LEGAL_RETURN_URL_KEY,
  removeSessionValue,
} from "@/components/legal/persistedLegalState";

export function LegalReturnButton() {
  const router = useRouter();

  function returnToSite() {
    const url = new URL(window.location.href);
    const queryReturnPath = getSafeReturnPath(url.searchParams.get("from"));
    const storedReturnPath = getSafeReturnPath(
      window.sessionStorage.getItem(LEGAL_RETURN_URL_KEY),
    );
    const returnPath = queryReturnPath || storedReturnPath;

    if (returnPath) {
      removeSessionValue(LEGAL_RETURN_URL_KEY);
      router.push(returnPath);
      return;
    }

    if (
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      type="button"
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-ink shadow-soft transition hover:border-action/30 hover:text-action"
      onClick={returnToSite}
    >
      <ArrowLeft className="size-4" />
      Вернуться на сайт
    </button>
  );
}

function getSafeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/privacy") || value.startsWith("/consent")) return null;
  return value;
}

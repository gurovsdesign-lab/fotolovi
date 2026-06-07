"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { rememberLegalReturnUrl } from "@/components/legal/persistedLegalState";

export function AppFooter() {
  const [returnPath, setReturnPath] = useState("");

  useEffect(() => {
    const nextReturnPath = `${window.location.pathname}${window.location.search}`;

    if (nextReturnPath.startsWith("/privacy") || nextReturnPath.startsWith("/consent")) {
      setReturnPath("");
      return;
    }

    setReturnPath(nextReturnPath);
  }, []);

  const privacyHref = returnPath
    ? `/privacy?from=${encodeURIComponent(returnPath)}`
    : "/privacy";
  const consentHref = returnPath
    ? `/consent?from=${encodeURIComponent(returnPath)}`
    : "/consent";

  function rememberReturnPath() {
    const returnPath = `${window.location.pathname}${window.location.search}`;

    if (returnPath.startsWith("/privacy") || returnPath.startsWith("/consent")) {
      return;
    }

    rememberLegalReturnUrl(returnPath);
  }

  return (
    <footer className="border-t border-black/5 bg-ivory/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{APP_NAME}</p>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2"
          aria-label="Юридические документы"
        >
          <Link
            className="transition hover:text-action"
            href={privacyHref}
            onClick={rememberReturnPath}
          >
            Политика конфиденциальности
          </Link>
          <Link
            className="transition hover:text-action"
            href={consentHref}
            onClick={rememberReturnPath}
          >
            Согласие на обработку персональных данных
          </Link>
        </nav>
      </div>
    </footer>
  );
}

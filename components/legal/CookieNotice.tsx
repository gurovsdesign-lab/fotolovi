"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "fotolovi-cookie-notice-dismissed";

export function CookieNotice() {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsReady(true);
    setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }

  if (!isReady || !isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:pb-5">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 text-sm text-ink shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-6 text-muted">Мы используем cookies для работы сайта.</p>
        <Button type="button" className="h-10 shrink-0 px-4" onClick={dismiss}>
          Понятно
        </Button>
      </div>
    </div>
  );
}

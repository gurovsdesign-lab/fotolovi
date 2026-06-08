"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function AdminUserSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextValue = value.trim();

      if (nextValue) {
        params.set("q", nextValue);
      } else {
        params.delete("q");
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      startTransition(() => router.replace(nextUrl, { scroll: false }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, value]);

  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Поиск по email, slug или названию"
        className="h-11 w-full rounded-xl border border-black/10 bg-white px-10 text-sm outline-none transition placeholder:text-muted focus:border-action/40"
      />
      {value ? (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      ) : null}
      {isPending ? (
        <span className="absolute -bottom-5 left-0 text-xs text-muted">Обновляем...</span>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingNavigation } from "./MarketingNavigation";
import { marketingSurface } from "@/lib/marketing/typography";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={[
        "min-h-screen",
        marketingSurface.page,
        "[--ml-accent:#B78B3F] [--ml-bg:#FAFAF8] [--ml-focus:rgba(74,108,247,0.22)]",
        "[--ml-ink:#202020] [--ml-line:rgba(32,32,32,0.12)] [--ml-muted:#69645C] [--ml-soft:#F2F0EA]",
      ].join(" ")}
    >
      <header className="border-b border-ml-line bg-ml-bg/95">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-display text-2xl text-ml-ink">
            ФотоЛови
          </Link>
          <MarketingNavigation />
        </div>
      </header>
      {children}
      <footer className="border-t border-ml-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-ml-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Marketing foundation</span>
          <Link href="/dashboard" className="font-medium text-ml-ink hover:underline">
            Перейти в кабинет
          </Link>
        </div>
      </footer>
    </div>
  );
}

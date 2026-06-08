import type { ReactNode } from "react";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { cn } from "@/lib/utils";
import { AppHeader } from "./AppHeader";

export function DashboardLayout({
  children,
  email,
  wide = false,
}: {
  children: ReactNode;
  email?: string | null;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <AppHeader email={email} />
      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 py-8 sm:py-10",
          wide ? "max-w-[1680px] sm:px-10 xl:px-12" : "max-w-6xl",
        )}
      >
        {children}
      </main>
      <AppFooter />
      <CookieNotice />
    </div>
  );
}

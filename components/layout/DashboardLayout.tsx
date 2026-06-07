import type { ReactNode } from "react";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { AppHeader } from "./AppHeader";

export function DashboardLayout({
  children,
  email,
}: {
  children: ReactNode;
  email?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <AppHeader email={email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
      <AppFooter />
      <CookieNotice />
    </div>
  );
}

import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

export function DashboardLayout({
  children,
  email,
}: {
  children: ReactNode;
  email?: string | null;
}) {
  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader email={email} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}

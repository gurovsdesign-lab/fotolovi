import Link from "next/link";
import { signOutAction } from "@/features/auth/actions";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-black/5 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="font-display text-2xl text-ink">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          {email ? <span className="hidden text-sm text-muted sm:inline">{email}</span> : null}
          {email ? (
            <form action={signOutAction}>
              <Button variant="secondary" className="h-10 px-4">
                Выйти
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}

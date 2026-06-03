"use client";

import { FormEvent, useState, useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { verifyGuestAccessCodeAction } from "@/features/events/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function GuestAccessGate({ slug }: { slug: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await verifyGuestAccessCodeAction(slug, code);

      if (result.error || !result.success) {
        setError(result.error || "Не удалось проверить код");
        return;
      }

      setError("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="grid gap-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-ivory text-action">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink">Введите код доступа</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Код показывается на экране проектора рядом с QR-кодом мероприятия.
            </p>
          </div>
        </div>
        <form className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={handleSubmit}>
          <Input
            id="guest-access-code"
            name="code"
            label="Код доступа"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
              if (error) setError("");
            }}
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="0000"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Проверяем..." : "Войти"}
          </Button>
        </form>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}

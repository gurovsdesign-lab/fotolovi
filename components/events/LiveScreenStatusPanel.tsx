"use client";

import { useTransition } from "react";
import { MonitorPlay, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { endSpotlightAction } from "@/features/spotlight/actions";
import type { LiveScreenStateWithParticipant } from "@/types/spotlight";

export function LiveScreenStatusPanel({
  eventId,
  liveState,
}: {
  eventId: string;
  liveState: LiveScreenStateWithParticipant;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const participantName =
    liveState.participant?.display_name || liveState.participant?.title || "участник";
  const isSpotlight = liveState.mode === "spotlight" && Boolean(liveState.participant);

  const handleEndSpotlight = () => {
    startTransition(async () => {
      await endSpotlightAction(eventId);
      router.refresh();
    });
  };

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-night p-6 text-white shadow-glow sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(214,179,106,0.24),transparent_28rem),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_46%)]" />
      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            {isSpotlight ? <Sparkles className="size-4" /> : <MonitorPlay className="size-4" />}
            Состояние проектора
          </p>
          <h2 className="mt-3 break-words font-display text-4xl leading-tight sm:text-5xl">
            {isSpotlight ? "Сейчас идёт представление" : "На экране: LIVE SCREEN"}
          </h2>
          <p className="mt-3 text-lg text-white/70">
            {isSpotlight ? `Сейчас представляется: ${participantName}` : "Фотографии гостей идут в обычном live-режиме."}
          </p>
        </div>
        {isSpotlight ? (
          <Button
            type="button"
            variant="secondary"
            className="border-white/15 bg-white/10 text-white hover:border-gold/40 hover:bg-white/15 hover:text-white"
            disabled={isPending}
            onClick={handleEndSpotlight}
          >
            {isPending ? "Завершаем..." : "Завершить представление"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

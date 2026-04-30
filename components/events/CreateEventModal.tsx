"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import { createEventAction, type EventActionState } from "@/features/events/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const initialState: EventActionState = {};

export function CreateEventModal({ credits }: { credits: number }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <Card className="grid gap-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Новое событие</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Создать мероприятие</h2>
      </div>
      <form action={formAction} className="grid gap-4">
        <Input id="title" name="title" label="Название мероприятия" placeholder="Свадьба Анны и Михаила" />
        <Input id="eventDate" name="eventDate" label="Дата мероприятия" type="date" />
        <label className="flex items-start gap-3 rounded-xl bg-ivory p-4 text-sm text-muted">
          <input
            name="useCredit"
            type="checkbox"
            className="mt-1 size-4 rounded border-black/20"
            disabled={credits < 1}
          />
          <span>
            Сделать платным мероприятием и списать 1 credit. Сейчас доступно:{" "}
            <b className="text-ink">{credits}</b>.
          </span>
        </label>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <Button disabled={pending} className="w-full sm:w-auto">
          <CalendarPlus className="size-4" />
          {pending ? "Создаём..." : "Создать мероприятие"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { FormEvent, useState, useTransition } from "react";
import { CalendarDays, Pencil, X } from "lucide-react";
import { updateEventDateAction } from "@/features/events/actions";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { getDashboardLifecycleMessage, getEventLifecycle } from "@/lib/eventStatus";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EventDateEditor({
  eventId,
  eventDate,
  today,
  canEdit,
}: {
  eventId: string;
  eventDate: string;
  today: string;
  canEdit: boolean;
}) {
  const [currentDate, setCurrentDate] = useState(eventDate);
  const [draftDate, setDraftDate] = useState(eventDate);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lifecycle = getEventLifecycle(currentDate, today);
  const lifecycleMessage = getDashboardLifecycleMessage(lifecycle);

  const openModal = () => {
    if (!canEdit) return;
    setDraftDate(currentDate);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draftDate) {
      setError("Укажите дату мероприятия");
      return;
    }

    startTransition(async () => {
      const result = await updateEventDateAction(eventId, draftDate);

      if (result.error || !result.eventDate) {
        setError(result.error || "Не удалось сохранить дату");
        return;
      }

      setCurrentDate(result.eventDate);
      setDraftDate(result.eventDate);
      setError("");
      setIsOpen(false);
    });
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-muted">
        <CalendarDays className="size-4" />
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <span>{formatDate(currentDate)}</span>
          <span className="text-muted/60">•</span>
          <EventStatusBadge status={lifecycle.status} />
        </span>
        {canEdit ? (
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-action"
            onClick={openModal}
            aria-label="Изменить дату мероприятия"
          >
            <Pencil className="size-3.5" />
          </button>
        ) : null}
      </div>
      {lifecycleMessage ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{lifecycleMessage}</p>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-date-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="event-date-title" className="text-xl font-semibold text-ink">
                  Изменить дату
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Дату можно менять только у мероприятий, которые ещё не прошли.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Закрыть окно изменения даты"
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
              <Input
                id="event-date"
                name="eventDate"
                type="date"
                label="Дата мероприятия"
                value={draftDate}
                min={today}
                onChange={(event) => {
                  setDraftDate(event.target.value);
                  if (error) setError("");
                }}
                disabled={isPending}
                autoFocus
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="grid gap-3 sm:ml-auto sm:w-max sm:grid-cols-[9.5rem_10.5rem]">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={isPending} className="w-full sm:w-auto">
                  Отмена
                </Button>
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? "Сохраняем..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteEventAction } from "@/features/events/actions";
import { Button } from "@/components/ui/Button";

export function DeleteEventButton({
  eventId,
  eventTitle,
  isPaid,
}: {
  eventId: string;
  eventTitle: string;
  isPaid: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitted) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitted]);

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 className="size-4" />
        Удалить мероприятие
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                  <AlertTriangle className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="delete-event-title" className="text-xl font-semibold text-ink">
                    Удалить мероприятие?
                  </h2>
                  <p className="mt-1 text-sm text-muted">{eventTitle}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitted}
                aria-label="Закрыть окно подтверждения"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Это действие необратимо.</p>
              <p className="mt-2">После удаления будут недоступны:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>все фотографии мероприятия</li>
                <li>экран проектора</li>
                <li>QR и access links</li>
                <li>данные мероприятия</li>
              </ul>
              {isPaid ? (
                <p className="mt-3 font-medium">Платный слот/лимит мероприятия не восстановится.</p>
              ) : null}
            </div>

            <form
              action={deleteEventAction}
              className="mt-6 grid gap-3 sm:ml-auto sm:w-max sm:grid-cols-[9.5rem_17.5rem]"
              aria-busy={isSubmitted}
              onSubmit={(event) => {
                if (isSubmitted) {
                  event.preventDefault();
                  return;
                }

                setIsSubmitted(true);
              }}
            >
              <input type="hidden" name="eventId" value={eventId} />
              {isSubmitted ? (
                <>
                  <Button type="button" variant="secondary" disabled className="w-full sm:w-auto">
                    Отмена
                  </Button>
                  <Button type="button" variant="danger" disabled className="w-full sm:w-auto">
                    <Trash2 className="size-4" />
                    Удаляем...
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                    Отмена
                  </Button>
                  <Button type="submit" variant="danger" className="w-full sm:w-auto">
                    <Trash2 className="size-4" />
                    Да, удалить навсегда
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

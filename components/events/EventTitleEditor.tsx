"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { renameEventAction } from "@/features/events/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EventTitleEditor({
  eventId,
  title,
  canEdit = true,
}: {
  eventId: string;
  title: string;
  canEdit?: boolean;
}) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [draftTitle, setDraftTitle] = useState(title);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending]);

  const openModal = () => {
    if (!canEdit) return;
    setDraftTitle(currentTitle);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      setError("Название не может быть пустым");
      return;
    }

    startTransition(async () => {
      const result = await renameEventAction(eventId, nextTitle);

      if (result.error || !result.title) {
        setError(result.error || "Не удалось сохранить название");
        return;
      }

      setCurrentTitle(result.title);
      setDraftTitle(result.title);
      setError("");
      setIsOpen(false);
    });
  };

  return (
    <>
      <div className="mt-3 flex min-w-0 items-center gap-2">
        <h1 className="min-w-0 break-words font-display text-4xl text-ink sm:text-5xl">{currentTitle}</h1>
        {canEdit ? (
          <button
            type="button"
            className="inline-flex size-10 shrink-0 -translate-y-0.5 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-action"
            onClick={openModal}
            aria-label="Переименовать мероприятие"
          >
            <Pencil className="size-4" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-event-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="rename-event-title" className="text-xl font-semibold text-ink">
                  Переименовать мероприятие
                </h2>
                <p className="mt-1 text-sm text-muted">Название обновится на странице сразу после сохранения.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Закрыть окно переименования"
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
              <Input
                id="event-title"
                name="title"
                label="Название мероприятия"
                value={draftTitle}
                onChange={(event) => {
                  setDraftTitle(event.target.value);
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

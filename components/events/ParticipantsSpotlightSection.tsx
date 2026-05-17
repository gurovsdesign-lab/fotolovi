"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Play, Plus, Square, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  createParticipantAction,
  deleteParticipantAction,
  endSpotlightAction,
  startSpotlightAction,
  updateParticipantAction,
  type ParticipantFields,
} from "@/features/spotlight/actions";
import type {
  LiveScreenStateWithParticipant,
  SpotlightParticipantWithPhotos,
} from "@/types/spotlight";

const emptyFields: Required<ParticipantFields> = {
  displayName: "",
  title: "",
  subtitle: "",
  body: "",
};

export function ParticipantsSpotlightSection({
  eventId,
  participants,
  liveState,
}: {
  eventId: string;
  participants: SpotlightParticipantWithPhotos[];
  liveState: LiveScreenStateWithParticipant;
}) {
  const router = useRouter();
  const [editorParticipant, setEditorParticipant] = useState<SpotlightParticipantWithPhotos | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeParticipantId =
    liveState.mode === "spotlight" ? liveState.active_participant_id : null;

  const handleStart = (participantId: string) => {
    setActionError("");
    setPendingActionId(`start-${participantId}`);
    startTransition(async () => {
      const result = await startSpotlightAction(eventId, participantId);
      setPendingActionId(null);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleEnd = () => {
    setActionError("");
    setPendingActionId("end");
    startTransition(async () => {
      const result = await endSpotlightAction(eventId);
      setPendingActionId(null);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = (participant: SpotlightParticipantWithPhotos) => {
    const label = participant.display_name || participant.title;
    if (!window.confirm(`Удалить участника: ${label}?`)) return;

    setActionError("");
    setPendingActionId(`delete-${participant.id}`);
    startTransition(async () => {
      const result = await deleteParticipantAction(participant.id);
      setPendingActionId(null);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Spotlight</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Моменты для представления</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Собирайте короткие истории, которые ведущий может вывести на экран в нужный момент.
          </p>
        </div>
        <Button type="button" variant="dark" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          Добавить участника
        </Button>
      </div>

      {actionError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p> : null}

      {participants.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {participants.map((participant) => {
            const isActive = activeParticipantId === participant.id;
            const presentationName = participant.display_name || participant.title;

            return (
              <article
                key={participant.id}
                className={`relative isolate overflow-hidden rounded-2xl border p-5 shadow-soft ${
                  isActive
                    ? "border-gold/50 bg-night text-white"
                    : "border-black/5 bg-white text-ink"
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 ${
                    isActive
                      ? "bg-[radial-gradient(circle_at_20%_0%,rgba(214,179,106,0.22),transparent_24rem)]"
                      : "bg-[radial-gradient(circle_at_12%_8%,rgba(214,179,106,0.14),transparent_18rem)]"
                  }`}
                />
                <div className="relative z-10 grid gap-5">
                  <div className="grid min-h-40 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,18,0.92),rgba(42,34,20,0.92))] p-6 text-center text-white">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold/90">
                        Представление
                      </p>
                      <p className="mt-3 font-display text-3xl leading-tight">{presentationName}</p>
                      <p className="mt-3 text-sm text-white/55">
                        Фото участника добавим следующим безопасным шагом
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive ? (
                        <span className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-gold">
                          Сейчас на экране
                        </span>
                      ) : null}
                      {participant.photos.length ? (
                        <span className={`text-xs ${isActive ? "text-white/55" : "text-muted"}`}>
                          {participant.photos.length} фото
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-display text-3xl leading-tight">{participant.title}</h3>
                    {participant.subtitle ? (
                      <p className={`mt-2 text-base ${isActive ? "text-white/72" : "text-muted"}`}>
                        {participant.subtitle}
                      </p>
                    ) : null}
                    {participant.body ? (
                      <p className={`mt-4 text-sm leading-6 ${isActive ? "text-white/70" : "text-muted"}`}>
                        {participant.body}
                      </p>
                    ) : (
                      <p className={`mt-4 text-sm leading-6 ${isActive ? "text-white/50" : "text-muted"}`}>
                        История гостя пока не добавлена.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isActive ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className={isActive ? "border-white/15 bg-white/10 text-white hover:border-gold/40 hover:bg-white/15 hover:text-white" : ""}
                        disabled={isPending && pendingActionId === "end"}
                        onClick={handleEnd}
                      >
                        <Square className="size-4" />
                        {pendingActionId === "end" ? "Завершаем..." : "Завершить"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="dark"
                        disabled={isPending && pendingActionId === `start-${participant.id}`}
                        onClick={() => handleStart(participant.id)}
                      >
                        <Play className="size-4" />
                        {pendingActionId === `start-${participant.id}` ? "Включаем..." : "Представить на экране"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      className={isActive ? "border-white/15 bg-white/10 text-white hover:border-gold/40 hover:bg-white/15 hover:text-white" : ""}
                      onClick={() => setEditorParticipant(participant)}
                    >
                      <Pencil className="size-4" />
                      Редактировать
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={isPending && pendingActionId === `delete-${participant.id}`}
                      onClick={() => handleDelete(participant)}
                    >
                      <Trash2 className="size-4" />
                      {pendingActionId === `delete-${participant.id}` ? "Удаляем..." : "Удалить"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white p-7 shadow-soft">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Пока нет подготовленных моментов
            </p>
            <h3 className="mt-3 font-display text-4xl text-ink">Добавьте первого участника</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Это будет не база гостей, а короткая история для красивого представления на экране.
            </p>
            <Button type="button" variant="dark" className="mt-5" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              Добавить участника
            </Button>
          </div>
        </div>
      )}

      {isCreateOpen ? (
        <ParticipantEditorModal
          mode="create"
          eventId={eventId}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editorParticipant ? (
        <ParticipantEditorModal
          mode="edit"
          eventId={eventId}
          participant={editorParticipant}
          onClose={() => setEditorParticipant(null)}
        />
      ) : null}
    </section>
  );
}

function ParticipantEditorModal({
  mode,
  eventId,
  participant,
  onClose,
}: {
  mode: "create" | "edit";
  eventId: string;
  participant?: SpotlightParticipantWithPhotos;
  onClose: () => void;
}) {
  const router = useRouter();
  const initialFields = useMemo<Required<ParticipantFields>>(
    () =>
      participant
        ? {
            displayName: participant.display_name ?? "",
            title: participant.title,
            subtitle: participant.subtitle ?? "",
            body: participant.body ?? "",
          }
        : emptyFields,
    [participant],
  );
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const updateField = (key: keyof ParticipantFields, value: string) => {
    setFields((currentFields) => ({ ...currentFields, [key]: value }));
    if (error) setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createParticipantAction(eventId, fields)
          : await updateParticipantAction(participant!.id, fields);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-editor-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Spotlight</p>
            <h2 id="participant-editor-title" className="mt-2 font-display text-3xl text-ink">
              {mode === "create" ? "Новый момент представления" : "Редактировать представление"}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isPending}
            aria-label="Закрыть окно редактирования"
          >
            <X className="size-5" />
          </button>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <TextField
            id="participant-display-name"
            label="Имя для статуса экрана"
            value={fields.displayName}
            maxLength={80}
            placeholder="Анна Петрова"
            hint="Необязательно. Покажем ведущему в статусе проектора."
            onChange={(value) => updateField("displayName", value)}
          />
          <TextField
            id="participant-title"
            label="Заголовок"
            value={fields.title}
            maxLength={40}
            placeholder="Сестра невесты"
            hint="Короткая роль или образ для представления."
            required
            onChange={(value) => updateField("title", value)}
          />
          <TextField
            id="participant-subtitle"
            label="Подзаголовок"
            value={fields.subtitle}
            maxLength={70}
            placeholder="Знакомы с 1 класса"
            hint="Контекст, который ведущий может сказать вслух."
            onChange={(value) => updateField("subtitle", value)}
          />
          <TextAreaField
            id="participant-body"
            label="Основной текст"
            value={fields.body}
            maxLength={300}
            placeholder="История, пожелание, воспоминание или смешной факт для момента."
            hint="До 300 символов. Лучше одна сильная мысль, чем длинный рассказ."
            onChange={(value) => updateField("body", value)}
          />

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-3 sm:ml-auto sm:w-max sm:grid-cols-[9.5rem_11.5rem]">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Отмена
            </Button>
            <Button type="submit" variant="dark" disabled={isPending}>
              {isPending ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  maxLength,
  placeholder,
  hint,
  required,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  hint: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-muted/70 focus:border-action focus:ring-4 focus:ring-action/10"
      />
      <span className="flex justify-between gap-4 text-xs text-muted">
        <span>{hint}</span>
        <span>{value.length}/{maxLength}</span>
      </span>
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  maxLength,
  placeholder,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  hint: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        rows={5}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-base leading-7 outline-none transition placeholder:text-muted/70 focus:border-action focus:ring-4 focus:ring-action/10"
      />
      <span className="flex justify-between gap-4 text-xs text-muted">
        <span>{hint}</span>
        <span>{value.length}/{maxLength}</span>
      </span>
    </label>
  );
}

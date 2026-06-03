"use client";

import { FormEvent, useState, useTransition } from "react";
import { Settings, X } from "lucide-react";
import { updateEventSettingsAction } from "@/features/events/actions";
import {
  normalizeGuestAccessMode,
  normalizeModerationMode,
  type GuestAccessMode,
  type ModerationMode,
} from "@/lib/eventSettings";
import { Button } from "@/components/ui/Button";

export function EventSettingsButton({
  eventId,
  guestAccessCodeEnabled,
  guestAccessCode,
  guestAccessMode,
  moderationMode,
}: {
  eventId: string;
  guestAccessCodeEnabled: boolean;
  guestAccessCode: string | null;
  guestAccessMode: GuestAccessMode;
  moderationMode: ModerationMode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCodeEnabled, setIsCodeEnabled] = useState(guestAccessCodeEnabled);
  const [currentCode, setCurrentCode] = useState(guestAccessCode);
  const [selectedAccessMode, setSelectedAccessMode] = useState<GuestAccessMode>(
    normalizeGuestAccessMode(guestAccessMode),
  );
  const [selectedModerationMode, setSelectedModerationMode] = useState<ModerationMode>(
    normalizeModerationMode(moderationMode),
  );
  const [shouldRegenerateCode, setShouldRegenerateCode] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openModal() {
    setIsCodeEnabled(Boolean(guestAccessCodeEnabled));
    setCurrentCode(guestAccessCode ?? null);
    setSelectedAccessMode(normalizeGuestAccessMode(guestAccessMode));
    setSelectedModerationMode(normalizeModerationMode(moderationMode));
    setShouldRegenerateCode(false);
    setError("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setIsOpen(false);
    setShouldRegenerateCode(false);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateEventSettingsAction(formData);

      if (result.error || !result.settings) {
        setError(result.error || "Не удалось сохранить настройки");
        return;
      }

      setIsCodeEnabled(result.settings.guestAccessCodeEnabled);
      setCurrentCode(result.settings.guestAccessCode);
      setSelectedAccessMode(result.settings.guestAccessMode);
      setSelectedModerationMode(result.settings.moderationMode);
      setShouldRegenerateCode(false);
      setError("");
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-xl border border-black/10 bg-white text-muted shadow-sm transition hover:border-action/30 hover:text-action"
        onClick={openModal}
        aria-label="Настройки мероприятия"
        title="Настройки мероприятия"
      >
        <Settings className="size-4" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-settings-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="event-settings-title" className="text-xl font-semibold text-ink">
                  Настройки мероприятия
                </h2>
                <p className="mt-1 text-sm text-muted">Эти настройки применяются только к текущему мероприятию.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Закрыть настройки"
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-6 grid gap-6" onSubmit={handleSubmit}>
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="guestAccessCode" value={currentCode ?? ""} />
              <input type="hidden" name="regenerateAccessCode" value={String(shouldRegenerateCode)} />

              <section className="grid gap-3 rounded-2xl bg-ivory p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">Код доступа для гостей</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Если включено, гости вводят 4-значный код после сканирования QR.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      name="guestAccessCodeEnabled"
                      checked={isCodeEnabled}
                      onChange={(event) => setIsCodeEnabled(event.target.checked)}
                      disabled={isPending}
                      className="size-4 accent-action"
                    />
                    Включить
                  </label>
                </div>
                {isCodeEnabled ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-xl bg-white px-4 py-2 text-lg font-semibold tracking-[0.18em] text-ink shadow-sm">
                      {shouldRegenerateCode ? "новый после сохранения" : currentCode ?? "создастся после сохранения"}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShouldRegenerateCode(true)}
                      disabled={isPending}
                    >
                      Обновить код
                    </Button>
                  </div>
                ) : null}
              </section>

              <section className="grid gap-3 rounded-2xl bg-ivory p-4">
                <h3 className="font-semibold text-ink">Режим доступа гостей к фотографиям</h3>
                <div className="grid gap-2">
                  <SettingRadio
                    name="guestAccessMode"
                    value="upload_only"
                    checked={selectedAccessMode === "upload_only"}
                    onChange={() => setSelectedAccessMode("upload_only")}
                    title="Только загрузка фотографий"
                    description="Гость может только загрузить фото."
                    disabled={isPending}
                  />
                  <SettingRadio
                    name="guestAccessMode"
                    value="upload_view"
                    checked={selectedAccessMode === "upload_view"}
                    onChange={() => setSelectedAccessMode("upload_view")}
                    title="Загрузка + просмотр общей галереи"
                    description="Гость может загрузить фото и смотреть общие фотографии."
                    disabled={isPending}
                  />
                  <SettingRadio
                    name="guestAccessMode"
                    value="upload_view_download"
                    checked={selectedAccessMode === "upload_view_download"}
                    onChange={() => setSelectedAccessMode("upload_view_download")}
                    title="Загрузка + просмотр + скачивание всех фотографий"
                    description="Гость может загрузить фото, смотреть галерею и скачать архив."
                    disabled={isPending}
                  />
                </div>
              </section>

              <section className="grid gap-3 rounded-2xl bg-ivory p-4">
                <h3 className="font-semibold text-ink">Модерация фотографий</h3>
                <div className="grid gap-2">
                  <SettingRadio
                    name="moderationMode"
                    value="show_immediately"
                    checked={selectedModerationMode === "show_immediately"}
                    onChange={() => setSelectedModerationMode("show_immediately")}
                    title="Показывать сразу"
                    description="Новые фото сразу попадают на экран проектора, как сейчас."
                    disabled={isPending}
                  />
                  <SettingRadio
                    name="moderationMode"
                    value="premoderation"
                    checked={selectedModerationMode === "premoderation"}
                    onChange={() => setSelectedModerationMode("premoderation")}
                    title="Премодерация"
                    description="Ведущий вручную на этой странице отбирает какие фотографии показывать на экране"
                    disabled={isPending}
                  />
                </div>
              </section>

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

function SettingRadio({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  disabled: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl bg-white p-3 text-sm shadow-sm transition hover:ring-1 hover:ring-action/20">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 size-4 accent-action"
      />
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="mt-1 block leading-5 text-muted">{description}</span>
      </span>
    </label>
  );
}

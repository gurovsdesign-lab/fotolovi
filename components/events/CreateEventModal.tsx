"use client";

import { FormEvent, useActionState, useState } from "react";
import { CalendarPlus, Check, Sparkles, X } from "lucide-react";
import { createEventAction, type EventActionState } from "@/features/events/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PremiumContactRequestModal } from "@/components/premium/PremiumContactRequestModal";
import { PremiumPackagesModal } from "@/components/premium/PremiumPackagesModal";
import { MAX_EVENT_TITLE_LENGTH } from "@/lib/constants";
import { getTodayDateString } from "@/lib/eventSettings";
import type { PremiumPackage } from "@/lib/premiumPackages";

const initialState: EventActionState = {};

export function CreateEventModal({ credits }: { credits: number }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [clientError, setClientError] = useState("");
  const [dateError, setDateError] = useState("");
  const [today] = useState(() => getTodayDateString());
  const [flowStep, setFlowStep] = useState<
    "closed" | "type" | "confirmPremium" | "packages"
  >("closed");
  const [selectedPackage, setSelectedPackage] = useState<PremiumPackage | null>(null);

  function openTypeSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextTitle = String(formData.get("title") || "").trim();
    const nextEventDate = String(formData.get("eventDate") || "");

    setTitle(nextTitle);
    setEventDate(nextEventDate);

    if (!nextTitle || !nextEventDate) {
      setClientError("Укажите название и дату мероприятия");
      return;
    }

    if (nextTitle.length > MAX_EVENT_TITLE_LENGTH) {
      setClientError(`Название должно быть не длиннее ${MAX_EVENT_TITLE_LENGTH} символов`);
      return;
    }

    if (nextEventDate < today) {
      setClientError("");
      setDateError("Эта дата уже прошла");
      return;
    }

    setClientError("");
    setDateError("");
    setFlowStep("type");
  }

  function updateEventDate(nextEventDate: string) {
    setEventDate(nextEventDate);
    setDateError(nextEventDate && nextEventDate < today ? "Эта дата уже прошла" : "");
  }

  function choosePremium() {
    if (credits > 0) {
      setFlowStep("confirmPremium");
      return;
    }

    setFlowStep("packages");
  }

  return (
    <>
      <Card className="grid gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Новое событие
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Создать мероприятие</h2>
        </div>
        <form onSubmit={openTypeSelection} className="grid gap-4" noValidate>
          <Input
            id="title"
            name="title"
            label="Название мероприятия"
            placeholder="Свадьба Анны и Михаила"
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, MAX_EVENT_TITLE_LENGTH))}
            maxLength={MAX_EVENT_TITLE_LENGTH}
            hint={`${title.length}/${MAX_EVENT_TITLE_LENGTH} символов`}
          />
          <Input
            id="eventDate"
            name="eventDate"
            label="Дата мероприятия"
            type="date"
            min={today}
            value={eventDate}
            onChange={(event) => updateEventDate(event.target.value)}
            className={
              dateError ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
            }
            aria-invalid={Boolean(dateError)}
            hint={dateError ? <span className="text-red-600">{dateError}</span> : null}
          />
          {clientError || state.error ? (
            <p className="text-sm text-red-600">{clientError || state.error}</p>
          ) : null}
          <Button disabled={pending} className="w-full sm:w-auto">
            <CalendarPlus className="size-4" />
            Создать мероприятие
          </Button>
        </form>
      </Card>

      {flowStep === "type" ? (
        <EventTypeModal
          title={title}
          eventDate={eventDate}
          pending={pending}
          formAction={formAction}
          onClose={() => setFlowStep("closed")}
          onChoosePremium={choosePremium}
        />
      ) : null}

      {flowStep === "confirmPremium" ? (
        <ConfirmPremiumModal
          title={title}
          eventDate={eventDate}
          pending={pending}
          formAction={formAction}
          onClose={() => setFlowStep("closed")}
        />
      ) : null}

      {flowStep === "packages" ? (
        <PremiumPackagesModal
          onClose={() => setFlowStep("closed")}
          onRequestPackage={(premiumPackage) => {
            setSelectedPackage(premiumPackage);
            setFlowStep("closed");
          }}
        />
      ) : null}

      {selectedPackage ? (
        <PremiumContactRequestModal
          premiumPackage={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      ) : null}
    </>
  );
}

type FlowFormAction = (payload: FormData) => void;

function EventTypeModal({
  title,
  eventDate,
  pending,
  formAction,
  onClose,
  onChoosePremium,
}: {
  title: string;
  eventDate: string;
  pending: boolean;
  formAction: FlowFormAction;
  onClose: () => void;
  onChoosePremium: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4">
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-soft sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-type-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Формат мероприятия
            </p>
            <h2 id="event-type-title" className="mt-2 text-2xl font-semibold text-ink">
              Выберите тип мероприятия
            </h2>
          </div>
          <CloseButton onClose={onClose} label="Закрыть выбор типа мероприятия" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <form action={formAction}>
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="eventDate" value={eventDate} />
            <input type="hidden" name="eventType" value="test" />
            <button
              type="submit"
              disabled={pending}
              className="grid h-full min-h-[210px] w-full gap-4 rounded-xl border border-black/10 bg-white p-5 text-left transition hover:border-action/30 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-ivory text-action">
                <Check className="size-5" />
              </span>
              <span>
                <span className="block text-xl font-semibold text-ink">
                  Тестовое мероприятие
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">
                  Лимит 30 фото для знакомства с продуктом.
                </span>
              </span>
              <span className="mt-auto text-sm font-medium text-action">
                {pending ? "Создаём..." : "Создать тестовое"}
              </span>
            </button>
          </form>
          <button
            type="button"
            onClick={onChoosePremium}
            className="grid min-h-[210px] gap-4 rounded-xl border border-gold/50 bg-[#FFFCF4] p-5 text-left shadow-glow transition hover:border-gold hover:shadow-soft"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-gold">
              <Sparkles className="size-5" />
            </span>
            <span>
              <span className="block text-xl font-semibold text-ink">
                Premium мероприятие
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted">
                Лимит 500 фото. Подходит для реальных мероприятий и работы с клиентами.
              </span>
            </span>
            <span className="mt-auto text-sm font-medium text-action">
              Выбрать premium
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmPremiumModal({
  title,
  eventDate,
  pending,
  formAction,
  onClose,
}: {
  title: string;
  eventDate: string;
  pending: boolean;
  formAction: FlowFormAction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-soft sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-confirm-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Premium мероприятие
            </p>
            <h2
              id="premium-confirm-title"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              Подтвердить создание
            </h2>
          </div>
          <CloseButton
            onClose={onClose}
            label="Закрыть подтверждение premium мероприятия"
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Создать premium мероприятие и списать 1 premium мероприятие из баланса?
        </p>
        <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="eventDate" value={eventDate} />
          <input type="hidden" name="eventType" value="premium" />
          <Button disabled={pending} className="w-full sm:w-auto">
            <Sparkles className="size-4" />
            {pending ? "Создаём..." : "Создать premium"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Отмена
          </Button>
        </form>
      </div>
    </div>
  );
}

function CloseButton({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink"
      onClick={onClose}
      aria-label={label}
    >
      <X className="size-5" />
    </button>
  );
}

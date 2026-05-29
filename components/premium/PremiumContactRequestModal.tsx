"use client";

import { FormEvent, useActionState, useState } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  submitPremiumRequestAction,
  type PremiumRequestState,
} from "@/features/premiumRequests/actions";
import type { PremiumPackage } from "@/lib/premiumPackages";

const initialState: PremiumRequestState = {};
const phoneContactMethods = new Set(["Телефон", "WhatsApp"]);

type PremiumContactRequestModalProps = {
  premiumPackage: PremiumPackage;
  onClose: () => void;
};

export function PremiumContactRequestModal({
  premiumPackage,
  onClose,
}: PremiumContactRequestModalProps) {
  const [state, formAction, pending] = useActionState(
    submitPremiumRequestAction,
    initialState,
  );
  const [preferredCommunication, setPreferredCommunication] = useState("Телефон");
  const [contact, setContact] = useState("+7 ");
  const [clientError, setClientError] = useState("");
  const isPhoneContact = phoneContactMethods.has(preferredCommunication);

  function updatePreferredCommunication(nextMethod: string) {
    setPreferredCommunication(nextMethod);
    setClientError("");

    if (phoneContactMethods.has(nextMethod)) {
      setContact(formatRussianPhone(contact));
      return;
    }

    setContact("");
  }

  function updateContact(nextContact: string) {
    setClientError("");
    setContact(isPhoneContact ? formatRussianPhone(nextContact) : nextContact);
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    if (isPhoneContact && getRussianPhoneDigits(contact).length < 10) {
      event.preventDefault();
      setClientError("Укажите номер телефона");
      return;
    }

    if (!isPhoneContact && !contact.trim()) {
      event.preventDefault();
      setClientError("Укажите Telegram username");
      return;
    }

    setClientError("");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4">
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-soft sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-contact-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Персональное подключение
            </p>
            <h2
              id="premium-contact-title"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              {state.success ? "Заявка отправлена" : premiumPackage.title}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink"
            onClick={onClose}
            aria-label="Закрыть заявку на premium"
          >
            <X className="size-5" />
          </button>
        </div>

        {state.success ? (
          <div className="mt-6 rounded-xl bg-[#F7FBF7] p-5 text-sm leading-6 text-muted">
            <CheckCircle2 className="size-9 text-green-600" />
            <p className="mt-4 font-medium text-ink">
              Мы получили заявку на premium пакет.
            </p>
            <p className="mt-2">
              Свяжемся лично, поможем подключиться и отправим информацию по оплате удобным
              способом.
            </p>
            <Button type="button" className="mt-5 w-full sm:w-auto" onClick={onClose}>
              Хорошо
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-muted">
              Оставьте контакт, и мы лично поможем подключить premium: уточним детали
              мероприятий, согласуем удобный способ оплаты и начислим пакет на ваш
              аккаунт.
            </p>
            <form
              action={formAction}
              onSubmit={validateBeforeSubmit}
              className="mt-6 grid gap-4"
            >
              <input type="hidden" name="packageId" value={premiumPackage.id} />
              <label
                className="grid gap-2 text-sm text-ink"
                htmlFor="preferredCommunication"
              >
                <span className="font-medium">Предпочитаемый способ связи</span>
                <select
                  id="preferredCommunication"
                  name="preferredCommunication"
                  required
                  className="h-12 rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition focus:border-action focus:ring-4 focus:ring-action/10"
                  value={preferredCommunication}
                  onChange={(event) => updatePreferredCommunication(event.target.value)}
                >
                  <option>Телефон</option>
                  <option>Telegram</option>
                  <option>WhatsApp</option>
                </select>
              </label>
              <Input
                id="premium-contact"
                name="contact"
                label={isPhoneContact ? "Номер для связи" : "Telegram username"}
                placeholder={isPhoneContact ? "+7 999 123-45-67" : "@example_username"}
                value={contact}
                onChange={(event) => updateContact(event.target.value)}
                required
                type={isPhoneContact ? "tel" : "text"}
                inputMode={isPhoneContact ? "tel" : "text"}
                autoComplete={isPhoneContact ? "tel" : "off"}
                className={
                  clientError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }
                aria-invalid={Boolean(clientError)}
                hint={
                  isPhoneContact
                    ? "Используем только для персонального подключения premium."
                    : "Укажите username в Telegram."
                }
              />
              <label className="grid gap-2 text-sm text-ink" htmlFor="premium-comment">
                <span className="font-medium">
                  Какие мероприятия вы планируете проводить?
                </span>
                <textarea
                  id="premium-comment"
                  name="comment"
                  rows={4}
                  className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition placeholder:text-muted/70 focus:border-action focus:ring-4 focus:ring-action/10"
                  placeholder="Например: свадьбы, корпоративы, выпускные, серия мероприятий агентства"
                />
              </label>
              {clientError || state.error ? (
                <p className="text-sm text-red-600">{clientError || state.error}</p>
              ) : null}
              <Button disabled={pending} className="w-full sm:w-auto">
                <Send className="size-4" />
                {pending ? "Отправляем..." : "Отправить заявку"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function formatRussianPhone(value: string) {
  const digits = getRussianPhoneDigits(value).slice(0, 10);
  const parts = [];

  if (digits.slice(0, 3)) parts.push(digits.slice(0, 3));
  if (digits.slice(3, 6)) parts.push(digits.slice(3, 6));

  const tail = [digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join("-");
  const formattedMiddle = parts.join(" ");

  if (!formattedMiddle && !tail) return "+7 ";
  if (!tail) return `+7 ${formattedMiddle}`;
  return `+7 ${formattedMiddle}-${tail}`;
}

function getRussianPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) return digits.slice(1);
  if (digits.startsWith("7")) return digits.slice(1);
  return digits;
}

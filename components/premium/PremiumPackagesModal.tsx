"use client";

import { Check, Sparkles, X } from "lucide-react";
import { PREMIUM_PACKAGES, type PremiumPackage } from "@/lib/premiumPackages";

type PremiumPackagesModalProps = {
  onClose: () => void;
  onRequestPackage: (premiumPackage: PremiumPackage) => void;
};

export function PremiumPackagesModal({
  onClose,
  onRequestPackage,
}: PremiumPackagesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4">
      <div
        className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-soft sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-packages-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Премиум-мероприятия
            </p>
            <h2
              id="premium-packages-title"
              className="mt-2 text-2xl font-semibold text-ink sm:text-3xl"
            >
              Выберите пакет для персонального подключения
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Во всех премиум-пакетах одинаковые возможности и лимит 500 фото на каждое
              мероприятие. Отличается только количество мероприятий: крупные пакеты
              выгоднее для ведущих и агентств, которые проводят события регулярно.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink"
            onClick={onClose}
            aria-label="Закрыть выбор премиум-пакета"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PREMIUM_PACKAGES.map((premiumPackage) => (
            <button
              key={premiumPackage.id}
              type="button"
              onClick={() => onRequestPackage(premiumPackage)}
              className={[
                "group relative grid min-h-[250px] gap-4 rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-gold/20",
                premiumPackage.isPopular
                  ? "border-gold/60 bg-[#FFFCF4] shadow-glow hover:border-gold"
                  : "border-black/10 bg-white hover:border-gold/50",
              ].join(" ")}
            >
              {premiumPackage.isPopular ? (
                <span className="absolute right-3 top-3 rounded-full bg-[#F4E6C7] px-3 py-1 text-xs font-semibold text-ink/80">
                  Популярный
                </span>
              ) : null}
              <div className="pr-20 xl:pr-0">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-ivory text-gold">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">
                  {premiumPackage.title}
                </h3>
                <p className="mt-2 text-3xl font-semibold text-ink">
                  {premiumPackage.priceLabel}
                </p>
                {premiumPackage.events > 1 ? (
                  <p className="mt-1 text-sm text-muted">
                    ≈ {premiumPackage.pricePerEvent.toLocaleString("ru-RU")} ₽ за
                    мероприятие
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">Для первого реального запуска</p>
                )}
              </div>
              <ul className="grid gap-2 text-sm text-muted">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>500 фото на каждое мероприятие</span>
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>Одинаковый функционал во всех пакетах</span>
                </li>
              </ul>
              <span
                className={[
                  "mt-auto inline-flex h-11 w-full items-center justify-center rounded-xl px-3 text-sm font-medium transition",
                  premiumPackage.isPopular
                    ? "bg-action text-white group-hover:bg-[#3859dd]"
                    : "border border-black/10 bg-white text-ink group-hover:border-action/30 group-hover:text-action",
                ].join(" ")}
              >
                Запросить подключение
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

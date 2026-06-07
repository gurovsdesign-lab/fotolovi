"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import {
  PREMIUM_CONTACT_DRAFT_KEY,
  readSessionJson,
  removeSessionValue,
  type PremiumContactDraft,
} from "@/components/legal/persistedLegalState";
import { Button } from "@/components/ui/Button";
import { PremiumContactRequestModal } from "@/components/premium/PremiumContactRequestModal";
import { PremiumPackagesModal } from "@/components/premium/PremiumPackagesModal";
import { PREMIUM_PACKAGES, type PremiumPackage } from "@/lib/premiumPackages";

export function PremiumBalanceBlock({ credits }: { credits: number }) {
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PremiumPackage | null>(null);
  const isEmpty = credits <= 0;
  const isLow = credits === 1;

  useEffect(() => {
    const draft = readSessionJson<PremiumContactDraft>(PREMIUM_CONTACT_DRAFT_KEY);
    if (!draft?.isOpen || draft.source !== "balance") return;

    const restoredPackage = PREMIUM_PACKAGES.find(
      (premiumPackage) => premiumPackage.id === draft.packageId,
    );

    if (restoredPackage) {
      setSelectedPackage(restoredPackage);
      setIsPackagesOpen(false);
    }
  }, []);

  function closeContactRequest() {
    removeSessionValue(PREMIUM_CONTACT_DRAFT_KEY);
    setSelectedPackage(null);
  }

  return (
    <>
      <div
        className={[
          "rounded-2xl border px-5 py-4 shadow-soft",
          isEmpty || isLow ? "border-gold/45 bg-[#FFFCF4]" : "border-black/5 bg-white",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                Премиум-баланс
              </p>
              {isEmpty || isLow ? <Sparkles className="size-4 text-gold" /> : null}
            </div>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-3xl font-semibold text-ink">{credits}</p>
              <span className="pb-1 text-sm font-medium text-muted">мероприятий</span>
            </div>
            {isEmpty ? (
              <p className="mt-2 max-w-sm text-sm leading-5 text-muted">
                Пополните баланс, чтобы создавать премиум-мероприятия для реальных
                клиентов.
              </p>
            ) : isLow ? (
              <p className="mt-2 max-w-sm text-sm leading-5 text-muted">
                Осталось одно премиум-мероприятие. Удобнее пополнить баланс заранее.
              </p>
            ) : (
              <p className="mt-2 max-w-sm text-sm leading-5 text-muted">
                Премиум-мероприятия: 500 фото на каждое событие.
              </p>
            )}
          </div>
          <Button
            type="button"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setIsPackagesOpen(true)}
          >
            <Plus className="size-4" />
            Пополнить
          </Button>
        </div>
      </div>

      {isPackagesOpen ? (
        <PremiumPackagesModal
          onClose={() => setIsPackagesOpen(false)}
          onRequestPackage={(premiumPackage) => {
            setSelectedPackage(premiumPackage);
            setIsPackagesOpen(false);
          }}
        />
      ) : null}

      {selectedPackage ? (
        <PremiumContactRequestModal
          premiumPackage={selectedPackage}
          source="balance"
          onClose={closeContactRequest}
        />
      ) : null}
    </>
  );
}

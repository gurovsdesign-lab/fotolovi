"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rememberLegalReturnUrl } from "@/components/legal/persistedLegalState";

type ConsentCheckboxProps = {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onBeforeLegalNavigate?: (checked: boolean) => void;
};

export function ConsentCheckbox({
  id = "personal-data-agreement",
  checked,
  onCheckedChange,
  onBeforeLegalNavigate,
}: ConsentCheckboxProps) {
  const [returnPath, setReturnPath] = useState("");

  useEffect(() => {
    setReturnPath(`${window.location.pathname}${window.location.search}`);
  }, []);

  const privacyHref = returnPath
    ? `/privacy?from=${encodeURIComponent(returnPath)}`
    : "/privacy";
  const consentHref = returnPath
    ? `/consent?from=${encodeURIComponent(returnPath)}`
    : "/consent";

  function rememberReturnPath() {
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    const nextChecked = Boolean(checkbox?.checked);
    const nextReturnPath = `${window.location.pathname}${window.location.search}`;

    onBeforeLegalNavigate?.(nextChecked);
    rememberLegalReturnUrl(nextReturnPath);
  }

  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/70 p-3 text-left text-xs leading-5 text-muted"
    >
      <input
        id={id}
        name="personalDataAgreement"
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-black/20 text-action accent-action"
      />
      <span>
        Продолжая, вы соглашаетесь с{" "}
        <Link
          className="font-medium text-action hover:text-[#3859dd]"
          href={privacyHref}
          onClick={rememberReturnPath}
        >
          Политикой конфиденциальности
        </Link>{" "}
        и даёте{" "}
        <Link
          className="font-medium text-action hover:text-[#3859dd]"
          href={consentHref}
          onClick={rememberReturnPath}
        >
          согласие на обработку персональных данных
        </Link>
        .
      </span>
    </label>
  );
}

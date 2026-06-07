"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ConsentCheckbox } from "@/components/legal/ConsentCheckbox";
import {
  AUTH_DRAFT_KEY_PREFIX,
  readSessionJson,
  type AuthDraft,
  writeSessionJson,
} from "@/components/legal/persistedLegalState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AuthState } from "@/features/auth/actions";
import { signInAction, signUpAction } from "@/features/auth/actions";

const initialState: AuthState = {};

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const storageKey = `${AUTH_DRAFT_KEY_PREFIX}${mode}`;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [personalDataAgreement, setPersonalDataAgreement] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  useEffect(() => {
    const draft = readSessionJson<AuthDraft>(storageKey);

    if (!draft) {
      setIsDraftHydrated(true);
      return;
    }

    setFullName(draft.fullName || "");
    setEmail(draft.email || "");
    setPersonalDataAgreement(Boolean(draft.personalDataAgreement));
    setIsDraftHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isDraftHydrated) return;

    saveDraft(personalDataAgreement);
  }, [email, fullName, isDraftHydrated, personalDataAgreement, storageKey]);

  function saveDraft(nextPersonalDataAgreement: boolean) {
    const form = document.getElementById(`${mode}-auth-form`) as HTMLFormElement | null;
    const formData = form ? new FormData(form) : null;

    writeSessionJson<AuthDraft>(storageKey, {
      fullName:
        mode === "register" ? String(formData?.get("fullName") || fullName) : fullName,
      email: String(formData?.get("email") || email),
      personalDataAgreement: nextPersonalDataAgreement,
    });
  }

  return (
    <form id={`${mode}-auth-form`} action={formAction} className="grid gap-4">
      {mode === "register" ? (
        <Input
          id="fullName"
          name="fullName"
          label="Имя"
          placeholder="Анна"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      ) : null}
      <Input
        id="email"
        name="email"
        type="email"
        label="Электронная почта"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Пароль"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode === "register" ? (
        <ConsentCheckbox
          id="register-personal-data-agreement"
          checked={personalDataAgreement}
          onCheckedChange={setPersonalDataAgreement}
          onBeforeLegalNavigate={saveDraft}
        />
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button disabled={pending} className="w-full">
        {pending ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <Link
          className="font-medium text-action"
          href={mode === "login" ? "/register" : "/login"}
        >
          {mode === "login" ? "Зарегистрироваться" : "Войти"}
        </Link>
      </p>
    </form>
  );
}

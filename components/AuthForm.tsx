"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AuthState } from "@/features/auth/actions";
import { signInAction, signUpAction } from "@/features/auth/actions";

const initialState: AuthState = {};

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      {mode === "register" ? (
        <Input id="fullName" name="fullName" label="Имя" placeholder="Анна" autoComplete="name" />
      ) : null}
      <Input id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" />
      <Input id="password" name="password" type="password" label="Пароль" autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button disabled={pending} className="w-full">
        {pending ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <Link className="font-medium text-action" href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Зарегистрироваться" : "Войти"}
        </Link>
      </p>
    </form>
  );
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export type AuthState = {
  error?: string;
};

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const supabase = await createServerSupabaseClient();
  let signInResult;

  try {
    signInResult = await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    logAuthError("SIGN IN ERROR", error);
    return { error: getReadableAuthError(error, "signin") };
  }

  const { error } = signInResult;

  if (error) {
    logAuthError("SIGN IN ERROR", error);
    return { error: getReadableAuthError(error, "signin") };
  }

  redirect(next);
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  if (password.length < 6) {
    return { error: "Пароль должен быть не короче 6 символов" };
  }

  const supabase = await createServerSupabaseClient();
  const origin = await getRequestOrigin();
  let signUpResult;

  try {
    signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });
  } catch (error) {
    logAuthError("SIGN UP ERROR", error);
    return { error: getReadableAuthError(error, "signup") };
  }

  const { data, error } = signUpResult;

  if (error) {
    logAuthError("SIGN UP ERROR", error);
    return { error: getReadableAuthError(error, "signup") };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName || null,
      role: "user",
    } as any);

    await supabase.from("credits").upsert({
      user_id: data.user.id,
      amount: 0,
    } as any);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) return origin;

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "https";

  if (host) return `${proto}://${host}`;
  if (process.env.NEXT_PUBLIC_SITE_URL)
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/g, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function getReadableAuthError(error: unknown, mode: "signin" | "signup") {
  const details = getAuthErrorDetails(error);
  const code = details.code?.toLowerCase();
  const message = details.message?.toLowerCase() || "";

  if (code === "user_already_exists" || message.includes("user already registered")) {
    return "Аккаунт с этой почтой уже существует. Войдите или используйте другую почту.";
  }

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Не удалось войти. Проверьте почту и пароль.";
  }

  if (message.includes("email not confirmed")) {
    return "Подтвердите электронную почту, чтобы войти.";
  }

  if (message.includes("password")) {
    return "Проверьте пароль и попробуйте ещё раз.";
  }

  if (message.includes("email")) {
    return "Проверьте электронную почту и попробуйте ещё раз.";
  }

  return mode === "signup"
    ? "Не удалось зарегистрироваться. Попробуйте ещё раз."
    : "Не удалось войти. Попробуйте ещё раз.";
}

function logAuthError(label: string, error: unknown) {
  console.error(label, getAuthErrorDetails(error));
}

function getAuthErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      name: "UnknownAuthError",
      message: String(error || "Unknown Supabase Auth error"),
      code: null,
      status: null,
    };
  }

  const errorRecord = error as Record<string, unknown>;

  return {
    name: toSafeString(errorRecord.name),
    message: toSafeString(errorRecord.message),
    code: toSafeString(errorRecord.code),
    status: typeof errorRecord.status === "number" ? errorRecord.status : null,
  };
}

function toSafeString(value: unknown) {
  return typeof value === "string" ? value : null;
}

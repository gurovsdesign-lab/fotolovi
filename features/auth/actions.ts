"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export type AuthState = {
  error?: string;
};

export async function signInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("SIGN IN ERROR:", getAuthErrorDetails(error));
    return { error: `Не удалось войти: ${formatAuthError(error)}` };
  }

  redirect(next);
}

export async function signUpAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("SIGN UP ERROR:", getAuthErrorDetails(error));
    return { error: `Не удалось зарегистрироваться: ${formatAuthError(error)}` };
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
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/g, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function formatAuthError(error: { message?: string; code?: string; status?: number }) {
  const details = [error.message, error.code ? `code: ${error.code}` : null, error.status ? `status: ${error.status}` : null]
    .filter(Boolean)
    .join(" ");

  return details || "неизвестная ошибка Supabase Auth";
}

function getAuthErrorDetails(error: { name?: string; message?: string; code?: string; status?: number }) {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
  };
}

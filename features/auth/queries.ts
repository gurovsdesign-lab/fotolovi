import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function requireAdmin() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, profile };
}

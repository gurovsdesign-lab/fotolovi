"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { PHOTO_BUCKET } from "@/lib/constants";

export async function addCreditsAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const userId = String(formData.get("userId") || "");
  const amount = Number(formData.get("amount") || 0);

  if (!userId || !Number.isFinite(amount) || amount === 0) return;

  const { data: current, error: selectError }: any = await supabase
    .from("credits")
    .select("amount")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    console.error("Failed to load credits before admin grant", {
      userId,
      message: selectError.message,
    });
    throw new Error("Не удалось прочитать credits пользователя");
  }

  const { error: upsertError } = await supabase.from("credits").upsert(
    {
      user_id: userId,
      amount: ((current as any)?.amount ?? 0) + amount,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: "user_id" },
  );

  if (upsertError) {
    console.error("Failed to grant credits by admin", {
      userId,
      amount,
      message: upsertError.message,
    });
    throw new Error("Не удалось начислить credits");
  }

  const { error: transactionError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    reason: "Начисление администратором",
  } as any);

  if (transactionError) {
    console.error("Failed to write admin credit transaction", {
      userId,
      amount,
      message: transactionError.message,
    });
    throw new Error("Не удалось сохранить транзакцию credits");
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function adminDeletePhotoAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const photoId = String(formData.get("photoId") || "");
  const storagePath = String(formData.get("storagePath") || "");

  if (!photoId || !storagePath) return;

  await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
  await supabase.from("photos").delete().eq("id", photoId);

  revalidatePath("/admin");
}

async function createAdminActionSupabaseClient() {
  const supabase = await createServerSupabaseClient({ persistCookies: false });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn("Ignored stale admin action without authenticated user", {
      message: userError?.message ?? null,
    });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || (profile as any)?.role !== "admin") {
    console.warn("Ignored stale admin action for non-admin session", {
      userId: user.id,
      profileFound: Boolean(profile),
      role: (profile as any)?.role ?? null,
      message: profileError?.message ?? null,
    });
    return null;
  }

  return supabase;
}

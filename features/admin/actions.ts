"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";
import { PHOTO_BUCKET } from "@/lib/constants";

export async function addCreditsAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const userId = String(formData.get("userId") || "");
  const amount = Number(formData.get("amount") || 0);

  if (!userId || !Number.isFinite(amount) || amount === 0) return;

  await grantCreditsToUser(supabase, userId, amount, "Начисление администратором");

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function confirmPremiumRequestAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const requestId = String(formData.get("requestId") || "");
  if (!requestId) return;

  const { data: request, error: requestError } = await (
    supabase.from("premium_requests") as any
  )
    .select("id,user_id,package_events,status")
    .eq("id", requestId)
    .maybeSingle();

  const premiumRequest = request as any;

  if (requestError || !premiumRequest || premiumRequest.status !== "pending") {
    console.error("Failed to load pending premium request before confirm", {
      requestId,
      message: requestError?.message ?? "Request is not pending",
    });
    return;
  }

  await grantCreditsToUser(
    supabase,
    premiumRequest.user_id,
    premiumRequest.package_events,
    `Пополнение премиум-баланса по заявке ${requestId}`,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: updateError } = await (supabase.from("premium_requests") as any)
    .update({
      status: "fulfilled",
      processed_at: new Date().toISOString(),
      processed_by: user?.id ?? null,
    } as any)
    .eq("id", requestId)
    .eq("status", "pending");

  if (updateError) {
    console.error("Failed to mark premium request as fulfilled", {
      requestId,
      message: updateError.message,
    });
    throw new Error("Не удалось обновить заявку");
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function cancelPremiumRequestAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const requestId = String(formData.get("requestId") || "");
  if (!requestId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await (supabase.from("premium_requests") as any)
    .update({
      status: "canceled",
      processed_at: new Date().toISOString(),
      processed_by: user?.id ?? null,
    } as any)
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    console.error("Failed to cancel premium request", {
      requestId,
      message: error.message,
    });
    throw new Error("Не удалось отменить заявку");
  }

  revalidatePath("/admin");
}

async function grantCreditsToUser(
  supabase: Awaited<ReturnType<typeof createAdminActionSupabaseClient>>,
  userId: string,
  amount: number,
  reason: string,
) {
  if (!supabase) return;

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
    reason,
  } as any);

  if (transactionError) {
    console.error("Failed to write admin credit transaction", {
      userId,
      amount,
      message: transactionError.message,
    });
    throw new Error("Не удалось сохранить транзакцию credits");
  }
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

export async function adminDeleteAccountAction(formData: FormData) {
  const supabase = await createAdminActionSupabaseClient();
  if (!supabase) return;

  const targetUserId = String(formData.get("userId") || "");
  const targetEmail = String(formData.get("email") || "");

  if (!targetUserId) return;

  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  if (!adminUser || adminUser.id === targetUserId) {
    throw new Error("Нельзя удалить текущий аккаунт администратора");
  }

  const serviceSupabase = createServiceRoleSupabaseClient();
  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", targetUserId)
    .maybeSingle();

  const targetProfile = profile as any;

  if (profileError || !targetProfile) {
    console.error("Failed to load profile before admin account deletion", {
      targetUserId,
      message: profileError?.message ?? "Profile not found",
    });
    throw new Error("Не удалось найти аккаунт для удаления");
  }

  if (targetEmail && targetProfile.email && targetEmail !== targetProfile.email) {
    throw new Error(
      "Данные аккаунта изменились. Обновите страницу и попробуйте ещё раз.",
    );
  }

  if (targetProfile.role === "admin") {
    throw new Error("Удаление аккаунта администратора недоступно в этом действии");
  }

  const storagePaths = await getUserPhotoStoragePaths(serviceSupabase, targetUserId);

  if (storagePaths.length) {
    const { error: storageError } = await serviceSupabase.storage
      .from(PHOTO_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error("Failed to remove account photos from storage before user deletion", {
        targetUserId,
        count: storagePaths.length,
        message: storageError.message,
      });
      throw new Error("Не удалось удалить фотографии аккаунта из хранилища");
    }
  }

  const { error: deleteUserError } =
    await serviceSupabase.auth.admin.deleteUser(targetUserId);

  if (deleteUserError) {
    console.error("Failed to delete auth user by admin", {
      targetUserId,
      email: targetProfile.email,
      message: deleteUserError.message,
    });
    throw new Error("Не удалось удалить аккаунт");
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

async function getUserPhotoStoragePaths(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  userId: string,
) {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .eq("user_id", userId);

  if (eventsError) {
    console.error("Failed to load user events before account deletion", {
      userId,
      message: eventsError.message,
    });
    throw new Error("Не удалось подготовить мероприятия аккаунта к удалению");
  }

  const eventIds = ((events ?? []) as Array<{ id: string }>).map((event) => event.id);
  if (!eventIds.length) return [];

  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("storage_path")
    .in("event_id", eventIds);

  if (photosError) {
    console.error("Failed to load user photo storage paths before account deletion", {
      userId,
      message: photosError.message,
    });
    throw new Error("Не удалось подготовить фотографии аккаунта к удалению");
  }

  return Array.from(
    new Set(
      ((photos ?? []) as Array<{ storage_path: string | null }>)
        .map((photo) => photo.storage_path)
        .filter(Boolean) as string[],
    ),
  );
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

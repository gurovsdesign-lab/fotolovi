"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getPremiumPackage } from "@/lib/premiumPackages";
import { requireUser } from "@/features/auth/queries";

export type PremiumRequestState = {
  error?: string;
  success?: boolean;
};

const CONTACT_METHODS = new Set(["Telegram", "WhatsApp", "Телефон"]);

export async function submitPremiumRequestAction(
  _prevState: PremiumRequestState,
  formData: FormData,
): Promise<PremiumRequestState> {
  const user = await requireUser();
  const packageId = String(formData.get("packageId") || "");
  const contact = String(formData.get("contact") || "").trim();
  const preferredCommunication = String(
    formData.get("preferredCommunication") || "",
  ).trim();
  const comment = String(formData.get("comment") || "").trim();
  const selectedPackage = getPremiumPackage(packageId);

  if (!selectedPackage) {
    return { error: "Выберите пакет премиум-мероприятий" };
  }

  if (!contact) {
    return { error: "Укажите контакт для связи" };
  }

  if (!CONTACT_METHODS.has(preferredCommunication)) {
    return { error: "Выберите предпочитаемый способ связи" };
  }

  if (
    (preferredCommunication === "Телефон" || preferredCommunication === "WhatsApp") &&
    getRussianPhoneDigits(contact).length < 11
  ) {
    return { error: "Укажите номер телефона" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await (supabase.from("premium_requests") as any).insert({
    user_id: user.id,
    package_id: selectedPackage.id,
    package_events: selectedPackage.events,
    package_total_price: selectedPackage.totalPrice,
    contact,
    preferred_communication: preferredCommunication,
    comment: comment || null,
    status: "pending",
  } as any);

  if (error) {
    console.error("Failed to create premium request", {
      userId: user.id,
      packageId,
      message: error.message,
    });
    return { error: "Не удалось отправить заявку. Попробуйте ещё раз." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return { success: true };
}

function getRussianPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

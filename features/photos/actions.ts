"use server";

import { revalidatePath } from "next/cache";
import { PHOTO_BUCKET } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { requireUser } from "@/features/auth/queries";

export async function togglePhotoVisibilityAction(formData: FormData) {
  await requireUser();
  const photoId = String(formData.get("photoId") || "");
  const eventId = String(formData.get("eventId") || "");
  const isHidden = formData.get("isHidden") === "true";

  if (!photoId || !eventId) return;

  const supabase = await createServerSupabaseClient();
  await (supabase.from("photos") as any).update({ is_hidden: !isHidden }).eq("id", photoId);

  revalidatePath(`/dashboard/events/${eventId}`);
}

export async function deletePhotoAction(formData: FormData) {
  await requireUser();
  const photoId = String(formData.get("photoId") || "");
  const eventId = String(formData.get("eventId") || "");
  const storagePath = String(formData.get("storagePath") || "");

  if (!photoId || !eventId || !storagePath) return;

  const supabase = await createServerSupabaseClient();
  await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
  await supabase.from("photos").delete().eq("id", photoId);

  revalidatePath(`/dashboard/events/${eventId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { PHOTO_BUCKET } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { requireUser } from "@/features/auth/queries";

type SupabaseMutationResult = Promise<{ error: { message: string } | null }>;

type PhotoUpdateQuery = {
  update(values: { is_hidden: boolean }): {
    eq(column: "id", value: string): SupabaseMutationResult;
  };
};

type EventSlugQuery = {
  select(columns: "slug"): {
    eq(column: "id", value: string): {
      maybeSingle(): Promise<{
        data: { slug: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function togglePhotoVisibilityAction(formData: FormData) {
  await requireUser();
  const photoId = String(formData.get("photoId") || "");
  const eventId = String(formData.get("eventId") || "");
  const isHidden = formData.get("isHidden") === "true";

  if (!photoId || !eventId) return;

  const supabase = await createServerSupabaseClient();
  const photos = supabase.from("photos") as unknown as PhotoUpdateQuery;
  const { error } = await photos
    .update({ is_hidden: !isHidden })
    .eq("id", photoId);

  if (error) {
    console.error("Failed to toggle photo visibility", {
      photoId,
      eventId,
      message: error.message,
    });
    throw new Error("Не удалось обновить видимость фото");
  }

  await revalidatePhotoPaths(supabase, eventId);
}

export async function deletePhotoAction(formData: FormData) {
  await requireUser();
  const photoId = String(formData.get("photoId") || "");
  const eventId = String(formData.get("eventId") || "");
  const storagePath = String(formData.get("storagePath") || "");

  if (!photoId || !eventId || !storagePath) return;

  const supabase = await createServerSupabaseClient();
  const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);

  if (storageError) {
    console.error("Failed to remove photo from storage", {
      photoId,
      eventId,
      storagePath,
      message: storageError.message,
    });
    throw new Error("Не удалось удалить файл фото");
  }

  const { error: deleteError } = await supabase.from("photos").delete().eq("id", photoId);

  if (deleteError) {
    console.error("Failed to delete photo row", {
      photoId,
      eventId,
      storagePath,
      message: deleteError.message,
    });
    throw new Error("Не удалось удалить фото");
  }

  await revalidatePhotoPaths(supabase, eventId);
}

async function revalidatePhotoPaths(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  eventId: string,
) {
  revalidatePath(`/dashboard/events/${eventId}`);

  const events = supabase.from("events") as unknown as EventSlugQuery;
  const { data, error } = await events
    .select("slug")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event slug for photo revalidation", {
      eventId,
      message: error.message,
    });
    return;
  }

  if (!data?.slug) return;

  revalidatePath(`/event/${data.slug}`);
  revalidatePath(`/live/${data.slug}`);
  revalidatePath(`/api/events/${data.slug}/photos`);
}

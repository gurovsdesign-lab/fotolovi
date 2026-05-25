import "server-only";

import { PHOTO_BUCKET } from "@/lib/constants";
import { getEventLifecycle, type EventLifecycle } from "@/lib/eventStatus";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";

type CleanupEvent = {
  id: string;
  event_date: string;
};

export async function ensureCompletedEventPhotosCleanup(
  event: CleanupEvent,
  lifecycle: EventLifecycle = getEventLifecycle(event.event_date),
) {
  if (lifecycle.status !== "completed") return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("event_id", event.id);

  if (photosError) {
    console.error("Failed to load completed event photos for cleanup", {
      eventId: event.id,
      message: photosError.message,
    });
    return;
  }

  if (!photos?.length) return;

  const completedPhotos = photos as { storage_path: string }[];
  const storagePaths = completedPhotos.map((photo) => photo.storage_path).filter(Boolean);
  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove(storagePaths);

    if (storageError) {
      console.error("Failed to remove completed event photos from storage", {
        eventId: event.id,
        message: storageError.message,
      });
      return;
    }
  }

  const { error: deleteError } = await supabase.from("photos").delete().eq("event_id", event.id);

  if (deleteError) {
    console.error("Failed to delete completed event photo rows", {
      eventId: event.id,
      message: deleteError.message,
    });
  }
}

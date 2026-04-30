import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";
import type { LiveScreenPhoto } from "@/types/live";

export async function getLiveScreenPhotos(eventId: string): Promise<LiveScreenPhoto[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id,public_url,uploaded_at")
    .eq("event_id", eventId)
    .eq("is_hidden", false)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Failed to load live screen photos", { eventId, message: error.message });
    return [];
  }

  return data;
}

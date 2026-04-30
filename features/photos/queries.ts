import { createServerSupabaseClient } from "@/lib/supabaseServer";
import type { Photo } from "@/types/photo";

export async function getEventPhotos(eventId: string, includeHidden = true): Promise<Photo[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: false });

  if (!includeHidden) {
    query = query.eq("is_hidden", false);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data;
}

export async function getPhotoCount(eventId: string) {
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  return count ?? 0;
}

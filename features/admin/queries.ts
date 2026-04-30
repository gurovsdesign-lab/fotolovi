import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function getAdminOverview() {
  const supabase = await createServerSupabaseClient();

  const [profiles, events, photos] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("photos").select("*").order("uploaded_at", { ascending: false }).limit(100),
  ]);

  return {
    profiles: profiles.data ?? [],
    events: events.data ?? [],
    photos: photos.data ?? [],
  };
}

import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";

export async function getAdminOverview() {
  const supabase = createServiceRoleSupabaseClient();

  const [profiles, events, photos, credits] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("photos").select("*").order("uploaded_at", { ascending: false }).limit(100),
    supabase.from("credits").select("user_id, amount"),
  ]);
  const creditsByUserId = new Map(
    ((credits.data ?? []) as Array<{ user_id: string; amount: number }>).map((credit) => [
      credit.user_id,
      credit.amount,
    ]),
  );
  const profileRows = (profiles.data ?? []) as Array<{ id: string } & Record<string, unknown>>;

  return {
    profiles: profileRows.map((profile) => ({
      ...profile,
      credits_amount: creditsByUserId.get(profile.id) ?? 0,
    })),
    events: events.data ?? [],
    photos: photos.data ?? [],
  };
}

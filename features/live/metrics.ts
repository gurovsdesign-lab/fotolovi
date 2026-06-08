import "server-only";

import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function recordLiveScreenLaunch(eventId: string, userId: string) {
  const supabase = await createServerSupabaseClient({ persistCookies: false });
  const { error } = await (supabase.from("live_screen_launches") as any).insert({
    event_id: eventId,
    user_id: userId,
  });

  if (error) {
    console.warn("Failed to record live screen launch", {
      eventId,
      message: error.message,
    });
  }
}

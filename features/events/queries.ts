import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import type { Event, EventWithPhotoCount } from "@/types/event";

type ProfileRole = {
  role: "user" | "admin";
};

export async function getUserEvents(userId: string): Promise<EventWithPhotoCount[]> {
  const supabase = await createServerSupabaseClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !events) return [];

  const typedEvents = events as Event[];
  const withCounts = await Promise.all(
    typedEvents.map(async (event) => {
      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);

      return {
        ...event,
        photos_count: count ?? 0,
      };
    }),
  );

  return withCounts;
}

export async function getEventById(id: string, userId: string): Promise<Event> {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  let query = supabase.from("events").select("*").eq("id", id);

  if ((profile as ProfileRole | null)?.role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error || !data) notFound();
  return data as Event;
}

export async function getPublicEvent(slug: string): Promise<Event> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();

  if (error || !data) notFound();
  return data as Event;
}

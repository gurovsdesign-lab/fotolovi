import { notFound } from "next/navigation";
import { FREE_EVENT_PHOTO_LIMIT, PAID_EVENT_PHOTO_LIMIT } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getEventLifecycle } from "@/lib/eventStatus";
import { ensureCompletedEventPhotosCleanup } from "@/features/photos/cleanup";
import type { Event, EventWithPhotoCount } from "@/types/event";

export async function getUserEvents(userId: string): Promise<EventWithPhotoCount[]> {
  const supabase = await createServerSupabaseClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !events) return [];

  const eventsAny = events as any[];
  const withCounts = await Promise.all(
    eventsAny.map(async (event) => {
      await ensureCompletedEventPhotosCleanup(event, getEventLifecycle(event.event_date));

      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);

      return {
        ...normalizeEventLimit(event),
        photos_count: count ?? 0,
      };
    }),
  );

  return withCounts;
}

export async function getEventById(id: string, userId: string): Promise<Event> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) notFound();
  const event = normalizeEventLimit(data as any);
  await ensureCompletedEventPhotosCleanup(event, getEventLifecycle(event.event_date));
  return event;
}

export async function getPublicEvent(slug: string): Promise<Event> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();

  if (error || !data) notFound();
  const event = normalizeEventLimit(data as any);
  await ensureCompletedEventPhotosCleanup(event, getEventLifecycle(event.event_date));
  return event;
}

function normalizeEventLimit<T extends { is_paid: boolean | null; photo_limit: number | null }>(event: T): T {
  return {
    ...event,
    photo_limit: event.is_paid ? PAID_EVENT_PHOTO_LIMIT : (event.photo_limit ?? FREE_EVENT_PHOTO_LIMIT),
  };
}

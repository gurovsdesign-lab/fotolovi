import { cookies } from "next/headers";
import { GuestAccessGate } from "@/components/events/GuestAccessGate";
import { PhotoDownloadAllButton, PhotoGrid } from "@/components/photos/PhotoGrid";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import {
  createGuestAccessCookieName,
  normalizeGuestAccessMode,
  normalizeModerationMode,
  type GuestAccessMode,
  type ModerationMode,
} from "@/lib/eventSettings";
import { createPublicSupabaseClient } from "@/lib/supabasePublic";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Photo } from "@/types/photo";
import type { Database } from "@/types/database";

type EventId = Database["public"]["Tables"]["events"]["Row"]["id"];

type GuestEvent = {
  id: EventId;
  title: string;
  slug: string;
  event_date: string;
  is_paid: boolean;
  photo_limit: number;
  guest_access_code_enabled: boolean;
  guest_access_code: string | null;
  guest_access_mode: GuestAccessMode;
  moderation_mode: ModerationMode;
};

type GuestEventRow = Omit<GuestEvent, "guest_access_code_enabled" | "guest_access_code" | "guest_access_mode" | "moderation_mode"> & {
  guest_access_code_enabled?: boolean | null;
  guest_access_code?: string | null;
  guest_access_mode?: string | null;
  moderation_mode?: string | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function GuestEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getGuestEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const hasAccess = await hasValidGuestAccess(event);
  const canViewGallery = event.guest_access_mode !== "upload_only";
  const canDownloadAll = event.guest_access_mode === "upload_view_download";
  const [photos, count] = await Promise.all([
    hasAccess && canViewGallery ? getGuestEventPhotos(event.id) : Promise.resolve([]),
    hasAccess ? getGuestPhotoCount(event.id) : Promise.resolve(0),
  ]);

  return (
    <main className="min-h-screen bg-ivory px-4 py-8">
      <div className="mx-auto grid w-full max-w-4xl gap-7">
        <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Фотоальбом мероприятия
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-6xl">{event.title}</h1>
          <p className="mt-3 text-muted">{formatDate(event.event_date)}</p>
        </section>

        {hasAccess ? (
          <PhotoUploader
            eventId={event.id}
            eventSlug={event.slug}
            photoLimit={event.photo_limit}
            currentCount={count}
            isPremoderated={event.moderation_mode === "premoderation"}
          />
        ) : (
          <GuestAccessGate slug={event.slug} />
        )}

        {hasAccess && canViewGallery ? (
          <section className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Общая галерея</h2>
                <p className="mt-1 text-sm text-muted">{photos.length} фото</p>
              </div>
              {canDownloadAll ? (
                <PhotoDownloadAllButton photos={photos} eventTitle={event.title} className="sm:items-end" />
              ) : null}
            </div>
            <PhotoGrid photos={photos} eventId={event.id} eventTitle={event.title} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

async function getGuestEventBySlug(slug: string): Promise<GuestEvent | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load guest event with public anon key: ${error.message}`);
  }

  return data ? normalizeGuestEvent(data as GuestEventRow) : null;
}

function normalizeGuestEvent(event: GuestEventRow): GuestEvent {
  return {
    ...event,
    guest_access_code_enabled: Boolean(event.guest_access_code_enabled),
    guest_access_code: event.guest_access_code ?? null,
    guest_access_mode: normalizeGuestAccessMode(event.guest_access_mode),
    moderation_mode: normalizeModerationMode(event.moderation_mode),
  };
}

async function hasValidGuestAccess(event: GuestEvent) {
  if (!event.guest_access_code_enabled) return true;
  const cookieStore = await cookies();
  const accessCode = cookieStore.get(createGuestAccessCookieName(event.slug))?.value;
  return Boolean(accessCode && accessCode === event.guest_access_code);
}

async function getGuestEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_hidden", false)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load guest event photos with public anon key: ${error.message}`);
  }

  return data;
}

async function getGuestPhotoCount(eventId: string) {
  const supabase = createPublicSupabaseClient();
  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`Failed to load guest photo count with public anon key: ${error.message}`);
  }

  return count ?? 0;
}

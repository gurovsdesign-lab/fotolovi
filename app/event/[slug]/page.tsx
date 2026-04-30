import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { createServiceRoleSupabaseClient } from "@/lib/supabaseService";
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

  const [photos, count] = await Promise.all([
    getGuestEventPhotos(event.id),
    getGuestPhotoCount(event.id),
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

        <PhotoUploader eventId={event.id} photoLimit={event.photo_limit} currentCount={count} />

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-ink">Общая галерея</h2>
            <span className="text-sm text-muted">{photos.length} фото</span>
          </div>
          <PhotoGrid photos={photos} eventId={event.id} />
        </section>
      </div>
    </main>
  );
}

async function getGuestEventBySlug(slug: string): Promise<GuestEvent | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,title,slug,event_date,is_paid,photo_limit")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load guest event: ${error.message}`);
  }

  return data;
}

async function getGuestEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_hidden", false)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load guest event photos: ${error.message}`);
  }

  return data;
}

async function getGuestPhotoCount(eventId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`Failed to load guest photo count: ${error.message}`);
  }

  return count ?? 0;
}

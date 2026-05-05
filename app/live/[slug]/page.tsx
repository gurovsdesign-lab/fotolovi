import { LiveScreen } from "@/components/live/LiveScreen";
import { getLiveScreenPhotos } from "@/features/live/queries";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getBaseUrl } from "@/lib/utils";
import type { LiveScreenEvent } from "@/types/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getLiveEventBySlug(slug);

  if (!event) {
    return <MissingLiveEvent slug={slug} />;
  }

  const photos = await getLiveScreenPhotos(event.id);
  const guestUrl = `${getBaseUrl()}/event/${event.slug}`;

  return <LiveScreen event={event} initialPhotos={photos} guestUrl={guestUrl} />;
}

async function getLiveEventBySlug(slug: string): Promise<LiveScreenEvent | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,title,slug,event_date,is_paid")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    console.error("Failed to load live event by slug", {
      slug,
      message: error.message,
    });
    return null;
  }

  return data;
}

function MissingLiveEvent({ slug }: { slug: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-night px-6 text-center text-white">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-gold/90">Live screen</p>
        <h1 className="mt-4 font-display text-5xl">Мероприятие не найдено</h1>
        <p className="mt-4 text-lg text-white/60">Проверьте ссылку: {slug}</p>
      </div>
    </main>
  );
}

import { LiveScreen } from "@/components/live/LiveScreen";
import { getLiveScreenPhotos } from "@/features/live/queries";
import { recordLiveScreenLaunch } from "@/features/live/metrics";
import { ensureCompletedEventPhotosCleanup } from "@/features/photos/cleanup";
import { getEventLifecycle, getEventStatusLabel, getLiveLifecycleMessage } from "@/lib/eventStatus";
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

  const lifecycle = getEventLifecycle(event.event_date);
  await ensureCompletedEventPhotosCleanup(event, lifecycle);
  const lifecycleMessage = getLiveLifecycleMessage(lifecycle);
  const photos = lifecycle.permissions.canShowLivePhotos ? await getLiveScreenPhotos(event.id) : [];
  const guestUrl = `${getBaseUrl()}/event/${event.slug}`;

  if (!lifecycle.permissions.canUseLiveScreen) {
    return (
      <InactiveLiveScreen
        title={event.title}
        status={getEventStatusLabel(lifecycle.status)}
        message={lifecycleMessage}
      />
    );
  }

  await recordLiveScreenLaunch(event.id, event.user_id);

  return (
    <LiveScreen
      event={event}
      initialPhotos={photos}
      guestUrl={guestUrl}
      showPhotos={lifecycle.permissions.canShowLivePhotos}
      explanatoryText={lifecycleMessage}
    />
  );
}

async function getLiveEventBySlug(slug: string): Promise<LiveScreenEvent | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
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

  const liveEvent = data as unknown as LiveScreenEvent;
  return {
    ...liveEvent,
    guest_access_code_enabled: Boolean(liveEvent.guest_access_code_enabled),
    guest_access_code: liveEvent.guest_access_code ?? null,
  };
}

function MissingLiveEvent({ slug }: { slug: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-night px-6 text-center text-white">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-gold/90">Экран проектора</p>
        <h1 className="mt-4 font-display text-5xl">Мероприятие не найдено</h1>
        <p className="mt-4 text-lg text-white/60">Проверьте ссылку: {slug}</p>
      </div>
    </main>
  );
}

function InactiveLiveScreen({
  title,
  status,
  message,
}: {
  title: string;
  status: string;
  message?: string | null;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-night px-6 text-center text-white">
      <div className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.18em] text-gold/90">{status}</p>
        <h1 className="mt-4 font-display text-5xl">{title}</h1>
        {message ? <p className="mt-4 text-lg leading-8 text-white/68">{message}</p> : null}
      </div>
    </main>
  );
}

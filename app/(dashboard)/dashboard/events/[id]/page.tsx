import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QRBlock } from "@/components/events/QRBlock";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";
import { EventTitleEditor } from "@/components/events/EventTitleEditor";
import { EventExperienceTabs } from "@/components/events/EventExperienceTabs";
import { LiveScreenStatusPanel } from "@/components/events/LiveScreenStatusPanel";
import { requireUser } from "@/features/auth/queries";
import { getEventById } from "@/features/events/queries";
import { getEventPhotos } from "@/features/photos/queries";
import { getEventParticipantsWithPhotos, getLiveScreenState } from "@/features/spotlight/queries";
import { formatDate, getBaseUrl } from "@/lib/utils";

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [event, photos, participants, liveState] = await Promise.all([
    getEventById(id, user.id),
    getEventPhotos(id),
    getEventParticipantsWithPhotos(id),
    getLiveScreenState(id),
  ]);
  const baseUrl = await getRequestBaseUrl();
  const guestUrl = `${baseUrl}/event/${event.slug}`;
  const liveUrl = `${baseUrl}/live/${event.slug}`;

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <Link
          href="/dashboard"
          className="inline-flex h-11 w-max items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-sm font-medium text-ink transition hover:border-action/30 hover:text-action focus:outline-none focus:ring-4 focus:ring-action/10"
        >
          <ArrowLeft className="size-4" />
          Назад
        </Link>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="grid gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Управление</p>
              <EventTitleEditor eventId={event.id} title={event.title} />
              <p className="mt-3 text-muted">{formatDate(event.event_date)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-ivory p-4">
                <p className="text-sm text-muted">Фото</p>
                <p className="mt-1 text-2xl font-semibold">{photos.length}</p>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <p className="text-sm text-muted">Лимит</p>
                <p className="mt-1 text-2xl font-semibold">{event.photo_limit}</p>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <p className="text-sm text-muted">Статус</p>
                <p className="mt-1 text-2xl font-semibold">{event.is_paid ? "Paid" : "Test"}</p>
              </div>
            </div>
            <DeleteEventButton eventId={event.id} eventTitle={event.title} isPaid={event.is_paid} />
          </Card>
          <QRBlock guestUrl={guestUrl} liveUrl={liveUrl} />
        </section>

        <LiveScreenStatusPanel eventId={event.id} liveState={liveState} />

        <EventExperienceTabs
          photos={photos}
          eventId={event.id}
          eventTitle={event.title}
          participants={participants}
          liveState={liveState}
        />
      </div>
    </DashboardLayout>
  );
}

async function getRequestBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "https";

  if (host) return `${proto}://${host}`;

  return getBaseUrl();
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QRBlock } from "@/components/events/QRBlock";
import { EventGallery } from "@/components/events/EventGallery";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";
import { EventDateEditor } from "@/components/events/EventDateEditor";
import { EventTitleEditor } from "@/components/events/EventTitleEditor";
import { EventSettingsButton } from "@/components/events/EventSettingsButton";
import { EventTypeBadge } from "@/components/events/EventStatusBadge";
import { requireUser } from "@/features/auth/queries";
import { getEventById } from "@/features/events/queries";
import { getEventPhotos } from "@/features/photos/queries";
import {
  getTodayDateString,
  normalizeGuestAccessMode,
  normalizeModerationMode,
} from "@/lib/eventSettings";
import { getEventLifecycle, isEventDateEditable } from "@/lib/eventStatus";

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [event, photos] = await Promise.all([getEventById(id, user.id), getEventPhotos(id)]);
  const baseUrl = "https://fotolovi.vercel.app";
  const guestUrl = `${baseUrl}/event/${event.slug}`;
  const liveUrl = `${baseUrl}/live/${event.slug}`;
  const today = getTodayDateString();
  const lifecycle = getEventLifecycle(event.event_date, today);
  const canEditDate = isEventDateEditable(lifecycle);
  const guestAccessMode = normalizeGuestAccessMode(event.guest_access_mode);
  const moderationMode = normalizeModerationMode(event.moderation_mode);

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
          <Card className="relative grid gap-6">
            <EventSettingsButton
              eventId={event.id}
              guestAccessCodeEnabled={Boolean(event.guest_access_code_enabled)}
              guestAccessCode={event.guest_access_code ?? null}
              guestAccessMode={guestAccessMode}
              moderationMode={moderationMode}
            />
            <div className="pr-12">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Управление</p>
              <EventTitleEditor eventId={event.id} title={event.title} />
              <EventDateEditor
                eventId={event.id}
                eventDate={event.event_date}
                today={today}
                canEdit={canEditDate}
              />
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
                <p className="text-sm text-muted">Тип</p>
                <div className="mt-3">
                  <EventTypeBadge isPaid={event.is_paid} />
                </div>
              </div>
            </div>
            <DeleteEventButton eventId={event.id} eventTitle={event.title} isPaid={event.is_paid} />
          </Card>
          <QRBlock guestUrl={guestUrl} liveUrl={liveUrl} eventTitle={event.title} />
        </section>

        {lifecycle.status === "completed" ? (
          <section className="rounded-2xl bg-white p-6 text-sm leading-6 text-muted shadow-soft">
            Срок хранения фотографий истёк. Галерея и скачивание для этого мероприятия недоступны.
          </section>
        ) : (
          <EventGallery
            photos={photos}
            eventId={event.id}
            eventTitle={event.title}
            allowDownloadAll={lifecycle.permissions.canDownload}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QRBlock } from "@/components/events/QRBlock";
import { EventGallery } from "@/components/events/EventGallery";
import { deleteEventAction } from "@/features/events/actions";
import { requireUser } from "@/features/auth/queries";
import { getEventById } from "@/features/events/queries";
import { getEventPhotos } from "@/features/photos/queries";
import { formatDate, getBaseUrl } from "@/lib/utils";

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [event, photos] = await Promise.all([getEventById(id, user.id), getEventPhotos(id)]);
  const baseUrl = "https://fotolovi.vercel.app";
  const guestUrl = `${baseUrl}/event/${event.slug}`;
  const liveUrl = `${baseUrl}/live/${event.slug}`;

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="grid gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Управление</p>
              <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{event.title}</h1>
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
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" disabled>
                <Download className="size-4" />
                Скачать все фото
              </Button>
              <form action={deleteEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button variant="danger">
                  <Trash2 className="size-4" />
                  Удалить мероприятие
                </Button>
              </form>
            </div>
            <p className="text-xs text-muted">TODO: zip-скачивание фото будет добавлено после первых тестов.</p>
          </Card>
          <QRBlock guestUrl={guestUrl} liveUrl={liveUrl} />
        </section>

        <EventGallery photos={photos} eventId={event.id} />
      </div>
    </DashboardLayout>
  );
}

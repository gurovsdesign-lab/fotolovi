import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventCard } from "@/components/events/EventCard";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { requireUser } from "@/features/auth/queries";
import { getCreditAmount } from "@/features/credits/queries";
import { getUserEvents } from "@/features/events/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const [events, credits] = await Promise.all([getUserEvents(user.id), getCreditAmount(user.id)]);

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Кабинет ведущего</p>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Мероприятия</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Создайте событие, покажите гостям QR-код и собирайте живые фото в одном альбоме.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-soft">
            <p className="text-sm text-muted">Доступно credits</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{credits}</p>
          </div>
        </section>

        <CreateEventModal credits={credits} />

        {events.length ? (
          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold text-ink">Ваши мероприятия</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(events as any[]).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            title="У вас пока нет мероприятий"
            description="Создайте первое мероприятие и получите QR-код для гостей."
            action={
              <span className="inline-flex items-center gap-2 text-sm font-medium text-action">
                <Plus className="size-4" />
                Форма создания уже выше
              </span>
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { getAdminUserDetail } from "@/features/admin/queries";
import type { AdminStorageUsage } from "@/features/admin/queries";
import { requireAdmin } from "@/features/auth/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { user } = await requireAdmin();
  const { userId } = await params;
  const query = await searchParams;
  const photoPage = Number(query?.page ?? 1);
  const detail = await getAdminUserDetail(userId, photoPage);
  const totalPages = Math.max(1, Math.ceil(detail.photos.total / detail.photos.pageSize));

  return (
    <DashboardLayout email={user.email} wide>
      <div className="grid gap-8">
        <section>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Назад в админку
          </Link>
          <h1 className="mt-4 font-display text-5xl text-ink">
            {detail.profile.email ?? "Пользователь"}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Дата регистрации" value={formatDate(detail.profile.created_at)} />
          <MetricCard label="Баланс" value={detail.profile.credits_amount} />
          <MetricCard label="Мероприятия" value={detail.profile.event_count} />
          <MetricCard label="Фотографии" value={detail.profile.photo_count} />
          <MetricCard label="Storage" value={formatBytes(detail.storage.usedBytes)} />
          <MetricCard label="Активность" value={formatDate(detail.profile.last_activity_at)} />
          <MetricCard label="Live screen запусков" value={detail.liveLaunchCount} />
          <StorageMiniCard storage={detail.storage} />
        </section>

        <Card>
          <h2 className="text-2xl font-semibold">Мероприятия</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="py-3">Название</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Фото</th>
                  <th>Live screen</th>
                  <th>Модерация</th>
                  <th>Доступ гостей</th>
                  <th>Создано</th>
                  <th>Обновлено</th>
                  <th>Запуски</th>
                </tr>
              </thead>
              <tbody>
                {detail.events.length ? (
                  detail.events.map((event) => (
                    <tr key={event.id} className="border-t border-black/5 align-top">
                      <td className="py-3 pr-4 font-medium">
                        <Link
                          href={`/event/${event.slug}`}
                          className="text-action transition hover:text-ink"
                        >
                          {getEventDisplayTitle(event)}
                        </Link>
                      </td>
                      <td className="pr-4">{event.statusLabel}</td>
                      <td className="pr-4">{formatDate(event.event_date)}</td>
                      <td className="pr-4">{event.photo_count}</td>
                      <td className="pr-4">
                        {event.live_screen_available ? "Включён" : "Выключен"}
                      </td>
                      <td className="pr-4">{getModerationLabel(event.moderation_mode)}</td>
                      <td className="pr-4">{getAccessModeLabel(event.guest_access_mode)}</td>
                      <td className="pr-4">{formatDate(event.created_at)}</td>
                      <td className="pr-4">{formatDate(event.updated_at)}</td>
                      <td>{event.live_screen_launch_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-black/5">
                    <td colSpan={10} className="py-6 text-center text-muted">
                      Мероприятий пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Фотографии</h2>
              <p className="mt-1 text-sm text-muted">
                {detail.photos.total} фото, страница {detail.photos.page} из {totalPages}
              </p>
            </div>
            <Pagination
              userId={userId}
              page={detail.photos.page}
              totalPages={totalPages}
            />
          </div>

          {detail.photos.items.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
              {detail.photos.items.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={photo.public_url}
                      alt="Фото"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-ink shadow-sm">
                      {photo.moderation_status}
                    </span>
                  </div>
                  <div className="grid gap-1 p-3 text-xs text-muted">
                    <Link
                      href={`/event/${photo.event_slug}`}
                      className="truncate font-medium text-ink transition hover:text-action"
                    >
                      {photo.event_title}
                    </Link>
                    <span>{photo.is_hidden ? "Скрыто" : "Видимо"}</span>
                    <span>{formatDate(photo.uploaded_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-ivory p-5 text-center text-muted">
              Фотографий пока нет
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

function StorageMiniCard({ storage }: { storage: AdminStorageUsage }) {
  return (
    <Card>
      <p className="text-sm text-muted">Storage лимит</p>
      <p className="mt-2 text-2xl font-semibold text-ink">
        {storage.usagePercent === null ? "Не задан" : `${storage.usagePercent}%`}
      </p>
      <p className="mt-2 text-xs text-muted">
        {storage.limitBytes === null
          ? "Лимит задаётся через env"
          : `${formatBytes(storage.freeBytes ?? 0)} свободно из ${formatBytes(storage.limitBytes)}`}
      </p>
    </Card>
  );
}

function Pagination({
  userId,
  page,
  totalPages,
}: {
  userId: string;
  page: number;
  totalPages: number;
}) {
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center gap-2">
      <PaginationLink
        href={`/admin/users/${userId}?page=${previousPage}`}
        disabled={page <= 1}
        label="Назад"
      >
        <ChevronLeft className="size-4" />
      </PaginationLink>
      <PaginationLink
        href={`/admin/users/${userId}?page=${nextPage}`}
        disabled={page >= totalPages}
        label="Вперёд"
      >
        <ChevronRight className="size-4" />
      </PaginationLink>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-medium text-muted opacity-50">
        {children}
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-medium text-ink transition hover:border-action/30 hover:text-action"
    >
      {children}
      {label}
    </Link>
  );
}

function getModerationLabel(value: "show_immediately" | "premoderation") {
  return value === "premoderation" ? "Включена" : "Выключена";
}

function getAccessModeLabel(
  value: "upload_only" | "upload_view" | "upload_view_download",
) {
  if (value === "upload_only") return "Только загрузка";
  if (value === "upload_view") return "Загрузка и просмотр";
  return "Загрузка, просмотр и скачивание";
}

function getEventDisplayTitle(event: { title: string; slug: string }) {
  const title = event.title.trim();
  return title || event.slug;
}

function formatBytes(value: number) {
  if (!value) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** index;
  return `${amount >= 10 || index === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[index]}`;
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { AdminUserSearch } from "@/components/admin/AdminUserSearch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  adminDeletePhotoAction,
  addCreditsAction,
  cancelPremiumRequestAction,
  confirmPremiumRequestAction,
} from "@/features/admin/actions";
import type { AdminPhotoGroup, AdminStorageUsage, AdminUserRow } from "@/features/admin/queries";
import { getAdminOverview } from "@/features/admin/queries";
import { requireAdmin } from "@/features/auth/queries";
import { formatPremiumPackageForAdmin } from "@/lib/premiumPackages";
import { formatDate } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; q?: string }>;
}) {
  const { user } = await requireAdmin();
  const params = await searchParams;
  const activeTab = params?.tab === "requests" ? "requests" : "credits";
  const overview = await getAdminOverview({ search: params?.q });

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Наблюдаемость продукта
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink">Админка</h1>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <Card>
            <p className="text-sm text-muted">Пользователи</p>
            <p className="mt-2 text-3xl font-semibold">{overview.usersTotal}</p>
            <p className="mt-3 text-xs text-muted">Общее количество аккаунтов</p>
          </Card>

          <Card>
            <p className="text-sm text-muted">Мероприятия</p>
            <p className="mt-2 text-3xl font-semibold">{overview.eventStats.total}</p>
            <div className="mt-4 grid gap-2 text-sm">
              {overview.eventStats.byStatus.map((item) => (
                <StatLine key={item.status} label={item.label} value={item.count} />
              ))}
              <StatLine label="С модерацией" value={overview.eventStats.moderationCount} />
              <StatLine label="С live screen" value={overview.eventStats.liveScreenCount} />
            </div>
          </Card>

          <Card>
            <p className="text-sm text-muted">Фотографии</p>
            <p className="mt-2 text-3xl font-semibold">{overview.photoStats.total}</p>
            <div className="mt-4 grid gap-2 text-sm">
              <StatLine label="Скрытые" value={overview.photoStats.hidden} />
              <StatLine
                label="На модерации"
                value={overview.photoStats.moderationPendingEstimate}
              />
              <StatLine label="Сегодня" value={overview.photoStats.today} />
              <StatLine label="За 7 дней" value={overview.photoStats.last7Days} />
            </div>
          </Card>

          <StorageCard storage={overview.storage} />
        </section>

        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Премиум</h2>
              {activeTab === "credits" ? (
                <p className="mt-1 text-sm text-muted">
                  Показаны первые {overview.usersLimit} пользователей
                  {overview.search ? " по поиску" : ""}.
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {activeTab === "credits" ? (
                <AdminUserSearch initialValue={overview.search} />
              ) : null}
              <div className="inline-flex rounded-xl bg-ivory p-1">
                <AdminTab
                  href={overview.search ? `/admin?q=${encodeURIComponent(overview.search)}` : "/admin"}
                  isActive={activeTab === "credits"}
                  label="Начисление"
                />
                <AdminTab
                  href={
                    overview.search
                      ? `/admin?tab=requests&q=${encodeURIComponent(overview.search)}`
                      : "/admin?tab=requests"
                  }
                  isActive={activeTab === "requests"}
                  label="Заявки"
                  count={overview.pendingPremiumRequestCount}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            {activeTab === "credits" ? (
              <CreditsTable profiles={overview.userRows} />
            ) : (
              <PremiumRequestsTable premiumRequests={overview.premiumRequests as any[]} />
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Фото</h2>
              <p className="mt-1 text-sm text-muted">
                Последние загрузки сгруппированы по мероприятиям и владельцам.
              </p>
            </div>
          </div>
          <PhotoGroups groups={overview.photoGroups} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

function AdminTab({
  href,
  isActive,
  label,
  count,
}: {
  href: string;
  isActive: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition",
        isActive ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
      ].join(" ")}
    >
      {label}
      {count ? (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-ink">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function StatLine({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function StorageCard({ storage }: { storage: AdminStorageUsage }) {
  const percent = storage.usagePercent ?? 0;

  return (
    <Card>
      <p className="text-sm text-muted">Supabase Storage</p>
      <p className="mt-2 text-3xl font-semibold">{formatBytes(storage.usedBytes)}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ivory">
        <div
          className="h-full rounded-full bg-action"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <StatLine label="Занято" value={formatBytes(storage.usedBytes)} />
        <StatLine
          label="Свободно"
          value={storage.freeBytes === null ? "Не задано" : formatBytes(storage.freeBytes)}
        />
        <StatLine
          label="Лимит"
          value={storage.limitBytes === null ? "Не задан" : formatBytes(storage.limitBytes)}
        />
        <StatLine
          label="Использование"
          value={storage.usagePercent === null ? "Не задано" : `${storage.usagePercent}%`}
        />
      </div>
      {storage.note ? <p className="mt-3 text-xs leading-5 text-muted">{storage.note}</p> : null}
    </Card>
  );
}

function CreditsTable({ profiles }: { profiles: AdminUserRow[] }) {
  return (
    <table className="w-full min-w-[1220px] text-left text-sm">
      <thead className="text-muted">
        <tr>
          <th className="py-3">Электронная почта</th>
          <th>Роль</th>
          <th>Баланс</th>
          <th>Дата</th>
          <th>Мероприятия</th>
          <th>Фото</th>
          <th>Live</th>
          <th>Последнее мероприятие</th>
          <th>Активность</th>
          <th>Начислить</th>
        </tr>
      </thead>
      <tbody>
        {profiles.length ? (
          profiles.map((profile) => (
            <tr key={profile.id} className="group border-t border-black/5 hover:bg-ivory/60">
              <ClickableCell href={`/admin/users/${profile.id}`} className="py-3 font-medium">
                <span className="inline-flex items-center gap-2">
                  {profile.email ?? "Почта не указана"}
                  <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                </span>
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {profile.role === "admin" ? "Администратор" : "Пользователь"}
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {profile.credits_amount ?? 0}
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {formatDate(profile.created_at)}
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>{profile.event_count}</ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>{profile.photo_count}</ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {profile.live_event_count}
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {formatDate(profile.last_event_at)}
              </ClickableCell>
              <ClickableCell href={`/admin/users/${profile.id}`}>
                {formatDate(profile.last_activity_at)}
              </ClickableCell>
              <td>
                <form action={addCreditsAction} className="flex gap-2">
                  <input type="hidden" name="userId" value={profile.id} />
                  <input
                    name="amount"
                    type="number"
                    defaultValue={1}
                    className="h-10 w-20 rounded-xl border border-black/10 px-3"
                  />
                  <Button className="h-10 px-3">Начислить</Button>
                </form>
              </td>
            </tr>
          ))
        ) : (
          <tr className="border-t border-black/5">
            <td colSpan={10} className="py-6 text-center text-muted">
              Пользователи не найдены
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function ClickableCell({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={className}>
      <Link href={href} className="block py-3 pr-4">
        {children}
      </Link>
    </td>
  );
}

function PremiumRequestsTable({ premiumRequests }: { premiumRequests: any[] }) {
  return (
    <table className="w-full min-w-[980px] text-left text-sm">
      <thead className="text-muted">
        <tr>
          <th className="py-3">Почта аккаунта</th>
          <th>Пакет</th>
          <th>Контакт</th>
          <th>Связь</th>
          <th>Комментарий</th>
          <th>Дата заявки</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody>
        {premiumRequests.length ? (
          premiumRequests.map((request) => (
            <tr
              key={request.id}
              className={[
                "border-t border-black/5 align-top",
                request.status === "pending" ? "bg-[#FFFCF4]" : "text-muted",
              ].join(" ")}
            >
              <td className="py-3 pr-4 text-ink">{request.account_email}</td>
              <td className="pr-4">
                {formatPremiumPackageForAdmin(
                  request.package_events,
                  request.package_total_price,
                )}
              </td>
              <td className="pr-4">{request.contact}</td>
              <td className="pr-4">{request.preferred_communication}</td>
              <td className="max-w-[240px] pr-4 leading-5">{request.comment || "—"}</td>
              <td className="pr-4">{formatDate(request.created_at)}</td>
              <td className="pr-4">
                <RequestStatus status={request.status} />
              </td>
              <td>
                {request.status === "pending" ? (
                  <div className="flex gap-2">
                    <form action={confirmPremiumRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button className="h-9 px-3">Подтвердить</Button>
                    </form>
                    <form action={cancelPremiumRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button variant="secondary" className="h-9 px-3">
                        Отменить
                      </Button>
                    </form>
                  </div>
                ) : (
                  <span className="text-muted">Обработано</span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr className="border-t border-black/5">
            <td colSpan={8} className="py-6 text-center text-muted">
              Заявок пока нет
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function RequestStatus({ status }: { status: "pending" | "fulfilled" | "canceled" }) {
  const label =
    status === "fulfilled" ? "Пополнено" : status === "canceled" ? "Отменено" : "Новая";
  const className =
    status === "fulfilled"
      ? "bg-green-50 text-green-700"
      : status === "canceled"
        ? "bg-black/5 text-muted"
        : "bg-gold/20 text-ink";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function PhotoGroups({ groups }: { groups: AdminPhotoGroup[] }) {
  if (!groups.length) {
    return <p className="mt-5 rounded-xl bg-ivory p-5 text-center text-muted">Фото пока нет</p>;
  }

  return (
    <div className="mt-5 grid gap-5">
      {groups.map((group) => (
        <div key={group.eventId} className="border-t border-black/5 pt-5 first:border-t-0 first:pt-0">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <Link
                href={`/event/${group.eventSlug}`}
                className="text-lg font-semibold text-ink transition hover:text-action"
              >
                {group.eventTitle}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                <Badge>{group.ownerEmail}</Badge>
                <Badge>{group.statusLabel}</Badge>
                <Badge>{group.photoCount} фото</Badge>
                <Badge>Создано: {formatDate(group.eventCreatedAt)}</Badge>
                <Badge>Последнее фото: {formatDate(group.lastPhotoAt)}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {group.photos.map((photo) => (
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
                    sizes="160px"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-ink shadow-sm">
                    {photo.moderation_status}
                  </span>
                </div>
                <form action={adminDeletePhotoAction} className="p-2">
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="storagePath" value={photo.storage_path} />
                  <Button variant="danger" className="h-9 w-full px-2" aria-label="Удалить фото">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-ivory px-3 py-1 font-medium text-muted">{children}</span>
  );
}

function formatBytes(value: number) {
  if (!value) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** index;
  return `${amount >= 10 || index === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[index]}`;
}

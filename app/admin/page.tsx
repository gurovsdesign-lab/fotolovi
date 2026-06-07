import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  adminDeletePhotoAction,
  addCreditsAction,
  cancelPremiumRequestAction,
  confirmPremiumRequestAction,
} from "@/features/admin/actions";
import { getAdminOverview } from "@/features/admin/queries";
import { requireAdmin } from "@/features/auth/queries";
import { formatPremiumPackageForAdmin } from "@/lib/premiumPackages";
import { formatDate } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { user } = await requireAdmin();
  const params = await searchParams;
  const activeTab = params?.tab === "requests" ? "requests" : "credits";
  const { profiles, events, photos, premiumRequests, pendingPremiumRequestCount } =
    await getAdminOverview();

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Admin v1
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink">Админка</h1>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-muted">Пользователи</p>
            <p className="mt-2 text-3xl font-semibold">{profiles.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Мероприятия</p>
            <p className="mt-2 text-3xl font-semibold">{events.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Фото</p>
            <p className="mt-2 text-3xl font-semibold">{photos.length}</p>
          </Card>
        </section>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">Премиум</h2>
            <div className="inline-flex rounded-xl bg-ivory p-1">
              <AdminTab
                href="/admin"
                isActive={activeTab === "credits"}
                label="Начисление"
              />
              <AdminTab
                href="/admin?tab=requests"
                isActive={activeTab === "requests"}
                label="Заявки"
                count={pendingPremiumRequestCount}
              />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            {activeTab === "credits" ? (
              <CreditsTable profiles={profiles as any[]} />
            ) : (
              <PremiumRequestsTable premiumRequests={premiumRequests as any[]} />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Последние фото</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {(photos as any[]).map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-black/5"
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.public_url}
                    alt="Фото"
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                </div>
                <form action={adminDeletePhotoAction} className="p-2">
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="storagePath" value={photo.storage_path} />
                  <Button variant="danger" className="h-9 w-full px-2">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
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

function CreditsTable({ profiles }: { profiles: any[] }) {
  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-muted">
        <tr>
          <th className="py-3">Электронная почта</th>
          <th>Role</th>
          <th>Credits</th>
          <th>Дата</th>
          <th>Начислить</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((profile) => (
          <tr key={profile.id} className="border-t border-black/5">
            <td className="py-3">{profile.email}</td>
            <td>{profile.role}</td>
            <td>{profile.credits_amount ?? 0}</td>
            <td>{formatDate(profile.created_at)}</td>
            <td>
              <form action={addCreditsAction} className="flex gap-2">
                <input type="hidden" name="userId" value={profile.id} />
                <input
                  name="amount"
                  type="number"
                  defaultValue={1}
                  className="h-10 w-20 rounded-xl border border-black/10 px-3"
                />
                <Button className="h-10 px-3">OK</Button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

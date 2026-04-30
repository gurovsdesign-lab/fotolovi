import Image from "next/image";
import { Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { adminDeletePhotoAction, addCreditsAction } from "@/features/admin/actions";
import { getAdminOverview } from "@/features/admin/queries";
import { requireAdmin } from "@/features/auth/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const { profiles, events, photos } = await getAdminOverview();

  return (
    <DashboardLayout email={user.email}>
      <div className="grid gap-8">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Admin v1</p>
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

        <Card className="overflow-x-auto">
          <h2 className="text-2xl font-semibold">Пользователи и credits</h2>
          <table className="mt-5 w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-3">Email</th>
                <th>Role</th>
                <th>Дата</th>
                <th>Начислить</th>
              </tr>
            </thead>
            <tbody>
              {(profiles as any[]).map((profile) => (
                <tr key={profile.id} className="border-t border-black/5">
                  <td className="py-3">{profile.email}</td>
                  <td>{profile.role}</td>
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
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Последние фото</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {(photos as any[]).map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-2xl border border-black/5">
                <div className="relative aspect-square">
                  <Image src={photo.public_url} alt="Фото" fill className="object-cover" sizes="180px" />
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

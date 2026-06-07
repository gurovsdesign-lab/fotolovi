"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addCreditsAction, adminDeleteAccountAction } from "@/features/admin/actions";
import { formatDate } from "@/lib/utils";

type AdminProfileRow = {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
  credits_amount?: number | null;
};

type ToastState = {
  id: number;
  type: "success" | "error";
  message: string;
} | null;

type AdminUsersTableProps = {
  profiles: AdminProfileRow[];
  currentAdminId: string;
};

export function AdminUsersTable({ profiles, currentAdminId }: AdminUsersTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState(profiles);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [isPending, startTransition] = useTransition();

  const visibleRows = useMemo(() => rows, [rows]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ id: Date.now(), type, message });
  }

  function handleDelete(profile: AdminProfileRow) {
    const accountLabel = profile.email || "этот аккаунт";
    const confirmed = window.confirm(
      `Удалить аккаунт ${accountLabel}? Будут удалены профиль, мероприятия, фотографии, заявки и доступ к аккаунту.`,
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.set("userId", profile.id);
    formData.set("email", profile.email || "");

    setDeletingUserId(profile.id);
    startTransition(async () => {
      try {
        const result = await adminDeleteAccountAction(formData);

        if (result.status === "success") {
          setRows((currentRows) =>
            currentRows.filter((row) => row.id !== result.deletedUserId),
          );
          showToast(
            "success",
            `Аккаунт ${result.deletedEmail || accountLabel} удалён. Таблица обновлена.`,
          );
          router.refresh();
        } else {
          showToast("error", result.message);
        }
      } catch {
        showToast("error", "Не удалось удалить аккаунт. Попробуйте ещё раз.");
      } finally {
        setDeletingUserId(null);
      }
    });
  }

  return (
    <div className="relative">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="text-muted">
          <tr>
            <th className="py-3">Электронная почта</th>
            <th>Роль</th>
            <th>Баланс</th>
            <th>Дата</th>
            <th>Начислить</th>
            <th>Удаление</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((profile) => {
            const isDeleting = deletingUserId === profile.id && isPending;
            const canDelete =
              profile.id !== currentAdminId &&
              profile.role !== "admin" &&
              !deletingUserId;

            return (
              <tr key={profile.id} className="border-t border-black/5">
                <td className="py-3">{profile.email}</td>
                <td>{getRoleLabel(profile.role)}</td>
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
                    <Button className="h-10 px-3">Начислить</Button>
                  </form>
                </td>
                <td className="py-3">
                  {profile.id !== currentAdminId && profile.role !== "admin" ? (
                    <Button
                      type="button"
                      variant="danger"
                      className="h-9 whitespace-nowrap px-3"
                      disabled={!canDelete}
                      onClick={() => handleDelete(profile)}
                    >
                      <Trash2 className="size-4" />
                      {isDeleting ? "Удаляем..." : "Удалить аккаунт"}
                    </Button>
                  ) : (
                    <span className="text-muted">Недоступно</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {toast ? (
        <div
          key={toast.id}
          className={[
            "fixed bottom-5 right-5 z-[80] max-w-sm rounded-2xl border p-4 text-sm leading-5 shadow-soft",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              className="text-xs font-medium opacity-70 hover:opacity-100"
              onClick={() => setToast(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getRoleLabel(role: string) {
  if (role === "admin") return "Администратор";
  return "Пользователь";
}

"use client";

import { Trash2 } from "lucide-react";
import { adminDeleteAccountAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/Button";

type AdminDeleteAccountButtonProps = {
  userId: string;
  email: string | null;
};

export function AdminDeleteAccountButton({
  userId,
  email,
}: AdminDeleteAccountButtonProps) {
  const accountLabel = email || "этот аккаунт";

  return (
    <form
      action={adminDeleteAccountAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Удалить аккаунт ${accountLabel}? Будут удалены профиль, мероприятия, фотографии, заявки и доступ к аккаунту.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="email" value={email || ""} />
      <Button variant="danger" className="h-9 whitespace-nowrap px-3">
        <Trash2 className="size-4" />
        Удалить аккаунт
      </Button>
    </form>
  );
}

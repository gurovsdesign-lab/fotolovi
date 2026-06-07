import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { Modal } from "@/components/ui/Modal";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 place-items-center px-4 py-10">
        <Modal title="Вход в ФотоЛови">
          <Suspense>
            <AuthForm mode="login" next={params.next} />
          </Suspense>
        </Modal>
      </main>
      <AppFooter />
      <CookieNotice />
    </div>
  );
}

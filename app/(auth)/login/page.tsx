import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Modal } from "@/components/ui/Modal";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Modal title="Вход в ФотоЛови">
        <Suspense>
          <AuthForm mode="login" next={params.next} />
        </Suspense>
      </Modal>
    </main>
  );
}

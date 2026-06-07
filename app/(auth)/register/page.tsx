import { AuthForm } from "@/components/AuthForm";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { Modal } from "@/components/ui/Modal";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 place-items-center px-4 py-10">
        <Modal title="Создайте аккаунт">
          <AuthForm mode="register" />
        </Modal>
      </main>
      <AppFooter />
      <CookieNotice />
    </div>
  );
}

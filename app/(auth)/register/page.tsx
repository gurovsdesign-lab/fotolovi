import { AuthForm } from "@/components/AuthForm";
import { Modal } from "@/components/ui/Modal";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Modal title="Создайте аккаунт">
        <AuthForm mode="register" />
      </Modal>
    </main>
  );
}

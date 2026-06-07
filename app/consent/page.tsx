import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { LegalReturnButton } from "@/components/legal/LegalReturnButton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных | ФотоЛови",
  description:
    "Короткое согласие пользователя на обработку персональных данных в FotoLovi.",
};

export default function ConsentPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <main className="flex-1 px-4 py-8 sm:py-10">
        <article className="mx-auto w-full max-w-3xl break-words">
          <LegalReturnButton />

          <header className="mt-7 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Документы FotoLovi
            </p>
            <h1 className="legal-title mt-3 min-w-0 font-display text-3xl leading-tight text-ink sm:text-5xl">
              Согласие на обработку персональных данных
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Обновлено 6 июня 2026 года
            </p>
          </header>

          <div className="mt-6 grid gap-4 text-sm leading-7 text-muted">
            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">1. Суть согласия</h2>
              <p className="mt-3">
                Продолжая пользоваться {APP_NAME}, регистрируясь, отправляя заявку или
                загружая фотографии, вы даёте согласие на обработку персональных данных
                для работы сервиса.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                2. Какие данные обрабатываются
              </h2>
              <p className="mt-3">
                Согласие распространяется на имя, электронную почту, контакт для связи,
                комментарии в формах, данные аккаунта, сведения о мероприятиях,
                загруженные фотографии, технические данные устройства и cookies.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                3. Что мы можем делать с данными
              </h2>
              <p className="mt-3">
                Мы можем собирать, записывать, хранить, уточнять, использовать, передавать
                техническим поставщикам, обезличивать, блокировать и удалять данные, когда
                это нужно для работы FotoLovi, поддержки пользователей, защиты сервиса и
                исполнения требований закона.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                4. Фотографии мероприятия
              </h2>
              <p className="mt-3">
                Загружая фотографии, вы подтверждаете, что понимаете: снимки могут быть
                показаны в альбоме и на экране соответствующего мероприятия, если это
                разрешено настройками события.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">5. Срок действия и отзыв</h2>
              <p className="mt-3">
                Согласие действует до его отзыва или до удаления данных, которые больше не
                требуются для работы сервиса, безопасности или исполнения требований
                закона. Чтобы отозвать согласие или запросить удаление данных, напишите на{" "}
                <a
                  className="font-medium text-action"
                  href="mailto:fotolovi.core@yandex.ru"
                >
                  fotolovi.core@yandex.ru
                </a>
                . После отзыва часть функций сервиса может стать недоступной.
              </p>
              <p className="mt-3">
                Резервные копии могут храниться ограниченное время после удаления.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                6. Дополнительная информация
              </h2>
              <p className="mt-3">
                Подробнее о целях, хранении, cookies и контактах написано в{" "}
                <Link className="font-medium text-action" href="/privacy">
                  Политике конфиденциальности
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <AppFooter />
      <CookieNotice />
    </div>
  );
}

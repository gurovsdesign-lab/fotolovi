import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/legal/AppFooter";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { LegalReturnButton } from "@/components/legal/LegalReturnButton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | ФотоЛови",
  description: "Как ФотоЛови собирает, использует и хранит данные пользователей.",
};

export default function PrivacyPage() {
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
              Политика конфиденциальности
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Обновлено 6 июня 2026 года
            </p>
          </header>

          <div className="mt-6 grid gap-4 text-sm leading-7 text-muted">
            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">1. Что делает сервис</h2>
              <p className="mt-3">
                {APP_NAME} помогает организаторам мероприятий собирать фотографии гостей,
                показывать их в альбоме и выводить снимки на экран мероприятия. Эта
                страница объясняет, какие данные нужны для работы сервиса и как с ними
                обращаться.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                2. Какие данные мы собираем
              </h2>
              <ul className="mt-3 grid gap-2">
                <li>Имя, электронную почту и пароль при регистрации.</li>
                <li>
                  Контакт для связи и комментарий, если вы оставляете заявку на пакет.
                </li>
                <li>
                  Название и дату мероприятия, настройки доступа и другие данные кабинета.
                </li>
                <li>Фотографии, которые загружают организаторы или гости мероприятия.</li>
                <li>
                  Технические данные: IP-адрес, тип устройства, браузер, время посещения,
                  сведения об ошибках и действиях на сайте.
                </li>
                <li>
                  Cookies и похожие технические идентификаторы, необходимые для входа,
                  защиты сессии, работы сайта и базовой аналитики.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                3. Зачем мы используем данные
              </h2>
              <ul className="mt-3 grid gap-2">
                <li>Создаём и защищаем аккаунт пользователя.</li>
                <li>Показываем мероприятия, альбомы, QR-коды и экран с фотографиями.</li>
                <li>
                  Принимаем заявки, отвечаем на вопросы и помогаем подключить пакеты.
                </li>
                <li>
                  Ограничиваем доступ к альбомам и поддерживаем безопасность сервиса.
                </li>
                <li>Улучшаем интерфейс, стабильность и скорость работы FotoLovi.</li>
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                4. Фотографии и показ на мероприятии
              </h2>
              <p className="mt-3">
                Загружая фотографии, пользователь подтверждает, что имеет право передать
                их в сервис и что такие материалы не нарушают права других людей. Если
                альбом мероприятия настроен на показ, загруженные фотографии могут быть
                видны гостям, организатору и отображаться на экране мероприятия.
              </p>
              <p className="mt-3">
                Организатор отвечает за настройки доступа, модерацию и законность
                использования фотографий в рамках своего мероприятия.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">
                5. Где и как хранятся данные
              </h2>
              <p className="mt-3">
                Данные хранятся в облачной инфраструктуре, которую использует FotoLovi,
                включая Vercel и Supabase. Мы применяем технические меры защиты,
                ограничиваем доступ к данным и используем их только для работы сервиса,
                поддержки пользователей и исполнения законных обязанностей.
              </p>
              <p className="mt-3">
                Фотографии и сведения о мероприятиях хранятся в течение срока, который
                нужен для работы альбома и функций скачивания, если в интерфейсе события
                не указан более короткий срок.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">6. Передача данных</h2>
              <p className="mt-3">
                Мы не продаём персональные данные. Данные могут обрабатываться нашими
                техническими поставщиками, например хостингом, базой данных, хранилищем
                файлов, почтовыми и аналитическими сервисами. Такие поставщики получают
                только тот объём данных, который нужен для работы FotoLovi.
              </p>
              <p className="mt-3">
                Также мы можем раскрыть данные, если этого требует законный запрос
                уполномоченного органа.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">7. Cookies и аналитика</h2>
              <p className="mt-3">
                Мы используем cookies для входа в аккаунт, сохранения сессии, безопасности
                и корректной работы сайта. Также сервис может использовать аналитические
                инструменты, чтобы понимать, какие разделы работают лучше и где возникают
                ошибки.
              </p>
              <p className="mt-3">
                Вы можете ограничить cookies в настройках браузера, но часть функций может
                работать хуже или стать недоступной.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">8. Как удалить данные</h2>
              <p className="mt-3">
                Чтобы удалить аккаунт, фотографии или отдельные сведения, напишите нам с
                адреса, связанного с аккаунтом, на{" "}
                <a className="font-medium text-action" href="mailto:privacy@fotolovi.ru">
                  privacy@fotolovi.ru
                </a>
                . Мы уточним запрос и удалим данные, если их хранение больше не требуется
                для работы сервиса, безопасности или исполнения закона.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-ink">9. Связь с нами</h2>
              <p className="mt-3">
                По общим вопросам пишите на{" "}
                <a className="font-medium text-action" href="mailto:support@fotolovi.ru">
                  support@fotolovi.ru
                </a>
                . По вопросам данных и удаления пишите на{" "}
                <a className="font-medium text-action" href="mailto:privacy@fotolovi.ru">
                  privacy@fotolovi.ru
                </a>
                .
              </p>
              <p className="mt-3">
                Короткий документ о согласии доступен на странице{" "}
                <Link className="font-medium text-action" href="/consent">
                  согласия на обработку персональных данных
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

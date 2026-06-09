import Link from "next/link";
import { getMarketingHref } from "@/lib/marketing/routes";
import styles from "./MarketingExperience.module.css";

const navigationGroups = [
  {
    label: "Возможности",
    columns: [
      {
        title: "Сбор фотографий",
        items: [
          { href: "/photo/guest-photo-collection/", label: "Сбор фото гостей", description: "Один QR вместо чатов и облачных папок" },
          { href: "/wedding/qr-photo-album/", label: "QR-альбом для свадьбы", description: "Свадебные фотографии без приложения" },
          { href: "/screen/what-to-show-on-wedding-projector/", label: "Экран и проектор", description: "Что показывать гостям во время вечера" },
        ],
      },
      {
        title: "Контроль доступа",
        items: [
          { href: "/qr/no-app/", label: "Загрузка без приложения", description: "Гость открывает браузер и отправляет фото" },
          { href: "/no-app/guest-upload-without-registration/", label: "Без регистрации гостей", description: "Минимум действий для людей на площадке" },
          { href: "/photo/live-gallery/", label: "Живая галерея", description: "Фотографии собираются во время события" },
        ],
      },
    ],
    feature: "QR, экран, доступ гостей и модерация работают как один сценарий мероприятия.",
  },
  {
    label: "Для кого",
    columns: [
      {
        title: "События",
        items: [
          { href: "/wedding/", label: "Свадьбы", description: "Фото гостей, приветственная зона и экран" },
          { href: "/events/corporate/", label: "Корпоративы", description: "Закрытый доступ и контроль показа" },
          { href: "/events/photo-gallery/", label: "Мероприятия", description: "Общий альбом для гостей и организатора" },
        ],
      },
      {
        title: "Профессионалы",
        items: [
          { href: "/hosts/", label: "Ведущие", description: "Простая механика со сцены" },
          { href: "/hosts/interactives/", label: "Интерактивы", description: "Фотоактивности без сложной подготовки" },
          { href: "/hosts/screen/", label: "Экран ведущего", description: "Показ фотографий в нужный момент" },
        ],
      },
    ],
    feature: "Сервис должен объясняться одной фразой, потому что на событии нет времени на инструктаж.",
  },
  {
    label: "Идеи",
    columns: [
      {
        title: "Материалы",
        items: [
          { href: "/ideas/wedding/", label: "Идеи для свадьбы", description: "Как встроить QR и экран в вечер" },
          { href: "/ideas/projector/", label: "Идеи для проектора", description: "Сценарии показа на экране" },
          { href: "/alternatives/google-drive-telegram/", label: "Сравнение способов", description: "Чаты, облака и QR-альбом" },
        ],
      },
      {
        title: "Вдохновение",
        items: [
          { href: "/wedding/welcome/", label: "Приветственный сценарий", description: "QR в зоне встречи гостей" },
          { href: "/wedding/wow-effects/", label: "Вау-эффекты", description: "Как удивить гостей без лишнего шума" },
          { href: "/ideas/guest-entertainment/", label: "Развлечения гостей", description: "Фото как участие в программе" },
        ],
      },
    ],
    feature: "Статьи не заменяют продуктовую страницу, а помогают собрать хороший сценарий вечера.",
  },
];

export function MarketingNavigation() {
  return (
    <>
      <nav aria-label="Основная навигация" className={styles.navCenter}>
        <Link href="/" className={styles.navLink}>
          Главная
        </Link>
        {navigationGroups.map((group) => (
          <details key={group.label} className={styles.mega}>
            <summary className={styles.navSummary}>{group.label}</summary>
            <div className={styles.megaPanel}>
              <div className={styles.megaPanelInner}>
                {group.columns.map((column) => (
                  <div key={column.title} className={styles.megaGroup}>
                    <p className={styles.megaTitle}>{column.title}</p>
                    {column.items.map((item) => (
                      <Link key={item.href} href={getMarketingHref(item.href)} className={styles.megaItem}>
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </Link>
                    ))}
                  </div>
                ))}
                <div className={styles.megaFeature}>
                  <p>{group.feature}</p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </nav>
      <div className={styles.navActions}>
        <Link href="/login" className={styles.buttonSecondary}>
          Войти
        </Link>
        <Link href="/register" className={styles.button}>
          Создать мероприятие
        </Link>
      </div>
      <details className={styles.mobileMenu}>
        <summary className={styles.mobileSummary}>Меню</summary>
        <div className={styles.mobilePanel}>
          <Link href="/">Главная</Link>
          <Link href="/wedding">Свадьбы</Link>
          <Link href="/photo/guest-photo-collection">Сбор фото</Link>
          <Link href="/hosts">Для ведущих</Link>
          <Link href="/ideas/wedding">Идеи</Link>
          <Link href="/register">Создать мероприятие</Link>
        </div>
      </details>
    </>
  );
}

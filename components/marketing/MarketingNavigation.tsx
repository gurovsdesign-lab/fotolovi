import Link from "next/link";
import { getMarketingHref } from "@/lib/marketing/routes";
import styles from "./MarketingExperience.module.css";

const navigationGroups = [
  {
    label: "Свадьбы",
    columns: [
      {
        title: "Сценарии",
        items: [
          { href: "/wedding/", label: "Свадебный раздел", description: "QR, экран и гостевые фото как часть вечера" },
          { href: "/ideas/wedding/", label: "Идеи для свадьбы", description: "Как встроить цифровой слой без лишнего шума" },
          { href: "/screen/wedding-screen-ideas/", label: "Экран на свадьбе", description: "Когда показывать фото гостей и QR" },
        ],
      },
      {
        title: "Материалы",
        items: [
          { href: "/screen/what-to-show-on-wedding-projector/", label: "Что показать на проекторе", description: "Приветствие, QR, фото и финальный экран" },
          { href: "/alternatives/google-drive-telegram/", label: "Чат или QR-сценарий", description: "Почему общий чат плохо собирает кадры" },
          { href: "/hosts/", label: "Для ведущего", description: "Как объявить механику одной фразой" },
        ],
      },
    ],
    feature: "Свадебный раздел собирает не страницы возможностей, а редакционные сценарии вокруг живого экрана и участия гостей.",
  },
  {
    label: "Идеи",
    columns: [
      {
        title: "Вдохновение",
        items: [
          { href: "/ideas/wedding/", label: "Цифровой слой свадьбы", description: "Идеи, которые не спорят с программой" },
          { href: "/screen/wedding-screen-ideas/", label: "Идеи для экрана", description: "Как экран становится частью вечера" },
          { href: "/wedding/", label: "Свадебная экосистема", description: "Контентный вход в сценарии вечера" },
        ],
      },
      {
        title: "Сравнения",
        items: [
          { href: "/alternatives/google-drive-telegram/", label: "Чаты и облака", description: "Когда привычные инструменты создают трение" },
          { href: "/screen/what-to-show-on-wedding-projector/", label: "Проектор без слайд-шоу", description: "Как сделать экран живым" },
          { href: "/hosts/", label: "Интерактив для ведущего", description: "Как удержать механику простой" },
        ],
      },
    ],
    feature: "Идеи помогают спроектировать вечер. ФотоЛови появляется внутри контекста, а не заменяет собой материал.",
  },
  {
    label: "Проектор",
    columns: [
      {
        title: "Экранные сценарии",
        items: [
          { href: "/screen/what-to-show-on-wedding-projector/", label: "Что показывать", description: "Сценарий экрана до, во время и после программы" },
          { href: "/screen/wedding-screen-ideas/", label: "Идеи для live screen", description: "Как удержать экран живым и спокойным" },
          { href: "/ideas/wedding/", label: "Экран внутри свадьбы", description: "Как не спорить с ритмом вечера" },
        ],
      },
      {
        title: "Механики",
        items: [
          { href: "/hosts/", label: "Для ведущего", description: "Как объявить механику одной фразой" },
          { href: "/alternatives/google-drive-telegram/", label: "Почему не общий чат", description: "Где теряются фотографии гостей" },
          { href: "/wedding/", label: "Свадебный сценарий", description: "QR, экран и гости в одном вечернем ритме" },
        ],
      },
    ],
    feature: "Проектор — главный эмоциональный слой продукта: фотографии появляются там, где их видят гости.",
  },
  {
    label: "Ведущим",
    columns: [
      {
        title: "Программа",
        items: [
          { href: "/hosts/", label: "Фото-интерактив", description: "Как встроить QR и экран в ход вечера" },
          { href: "/screen/wedding-screen-ideas/", label: "Экранные моменты", description: "Когда выводить гостевые фотографии" },
          { href: "/ideas/wedding/", label: "Фото-задания", description: "Поводы, которые легко объявить со сцены" },
        ],
      },
      {
        title: "Контроль",
        items: [
          { href: "/screen/wedding-screen-ideas/", label: "Паузы и экран", description: "Когда показывать гостевые фото" },
          { href: "/ideas/wedding/", label: "Фото-задания", description: "Простые поводы для гостей" },
          { href: "/alternatives/google-drive-telegram/", label: "Почему не чат", description: "Аргументы для организатора" },
        ],
      },
    ],
    feature: "Для ведущего важна механика, которую можно объяснить быстро и держать под контролем на экране.",
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
        <Link href="/#faq" className={styles.navLink}>
          FAQ
        </Link>
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
          <Link href="/ideas/wedding">Идеи</Link>
          <Link href="/screen/wedding-screen-ideas">Проектор</Link>
          <Link href="/hosts">Ведущим</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/register">Создать мероприятие</Link>
        </div>
      </details>
    </>
  );
}

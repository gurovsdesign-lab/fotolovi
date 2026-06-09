import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./MarketingExperience.module.css";
import {
  getMarketingParent,
  getMarketingHref,
  getMarketingRelatedRoutes,
  type MarketingRoute,
} from "@/lib/marketing/routes";

export function MarketingPlaceholderPage({ route }: { route: MarketingRoute }) {
  const parent = getMarketingParent(route);
  const relatedRoutes = getMarketingRelatedRoutes(route.path).slice(0, 8);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{route.pageType}</p>
          <h1 className={styles.h1}>{route.title}</h1>
          <p className={styles.lead}>{route.intent}</p>
          <div className={styles.placeholderMeta}>
            <span>Приоритет: {route.priority}</span>
            <span>Уровень: {route.level}</span>
            <span>Страница готовится</span>
          </div>
        </div>

        <div className={styles.asymmetricGrid}>
          <section className={styles.card}>
            <h2>Страница в разработке</h2>
            <p>
              Этот адрес уже закреплён в структуре сайта, чтобы будущая страница не
              выпадала из навигации. Пока она закрыта от индексации и не попадает в карту сайта.
            </p>
            <div className={styles.sectionActions}>
              <Link href="/register" className={styles.button}>
                Создать мероприятие
              </Link>
              {parent ? (
                <Link href={getMarketingHref(parent.path)} className={styles.buttonSecondary}>
                  Вернуться: {parent.title}
                </Link>
              ) : null}
            </div>
          </section>

          <aside className={styles.card}>
            <h2>Связанные страницы</h2>
            <div className={styles.workflow}>
              {relatedRoutes.length ? (
                relatedRoutes.map((item) => (
                  <Link
                    key={item.path}
                    href={getMarketingHref(item.path)}
                    className={styles.megaItem}
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ))
              ) : (
                <p>Связанные страницы будут добавлены позже.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

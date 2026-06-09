import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./MarketingExperience.module.css";
import { getMarketingHref, getMarketingRoute, type MarketingRoute } from "@/lib/marketing/routes";
import { type MarketingPage } from "@/lib/marketing/content";

type MarketingPageRendererProps = {
  page: MarketingPage;
  route: MarketingRoute;
};

export function MarketingPageRenderer({ page, route }: MarketingPageRendererProps) {
  if (page.kind === "home") {
    return <HomePage page={page} />;
  }

  if (page.kind === "article") {
    return <ArticlePage page={page} route={route} />;
  }

  return <StructuredPage page={page} route={route} />;
}

function HomePage({ page }: { page: MarketingPage }) {
  return (
    <main className={styles.main}>
      <Hero page={page} />
      {page.workflow ? <Workflow sections={page.workflow} /> : null}
      <SectionSet page={page} />
      {page.specs ? <SpecSheet specs={page.specs} /> : null}
      <Pricing />
      <CtaBand title="Первое мероприятие можно проверить спокойно" body="Создайте тестовый запуск, покажите QR небольшой группе и посмотрите, как гости добавляют фотографии без приложения." cta="Создать мероприятие" />
      <RelatedLinks paths={page.related ?? []} />
    </main>
  );
}

function StructuredPage({ page }: MarketingPageRendererProps) {
  return (
    <main className={styles.main}>
      <Hero page={page} compact />
      {page.workflow ? <Workflow sections={page.workflow} /> : null}
      <SectionSet page={page} />
      {page.specs ? <SpecSheet specs={page.specs} /> : null}
      <CtaBand title="Соберите фотографии без лишней логистики" body="ФотоЛови оставляет гостям простое действие, а организатору — понятный альбом, экран и настройки доступа." cta={page.primaryCta} />
      <RelatedLinks paths={page.related ?? []} />
    </main>
  );
}

function ArticlePage({ page }: MarketingPageRendererProps) {
  return (
    <main className={styles.main}>
      <section className={styles.articleHero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.articleTitle}>{page.title}</h1>
          <p className={styles.lead}>{page.description}</p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.button}>
              {page.primaryCta}
            </Link>
            <Link href="/" className={styles.buttonSecondary}>
              На главную
            </Link>
          </div>
        </div>
        <EventCanvas title="Общий альбом" />
      </section>

      <section className={styles.articleShell}>
        <nav className={styles.categoryNav} aria-label="Навигация по статье">
          {(page.articleNav ?? []).map((item) => (
            <a key={item} href={`#${slugify(item)}`}>
              {item}
            </a>
          ))}
        </nav>
        <article className={styles.articleContent}>
          {page.sections.map((section) => (
            <section key={section.title} id={slugify(section.title)} className={styles.articleBlock}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <blockquote className={styles.quoteBlock}>
            Хорошая цифровая механика не просит внимания к себе. Она помогает гостям оставить кадры и возвращается в фон.
          </blockquote>
          <CtaBand title="ФотоЛови как аккуратный слой события" body="Отдельный QR, экран, модерация и скачивание архива живут рядом с программой вечера, не превращая праздник в технический брифинг." cta={page.primaryCta} compact />
        </article>
      </section>
      <RelatedLinks paths={page.related ?? []} />
    </main>
  );
}

function Hero({ page, compact = false }: { page: MarketingPage; compact?: boolean }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.h1}>{page.title}</h1>
          <p className={styles.lead}>{page.description}</p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.button}>
              {page.primaryCta}
            </Link>
            {page.secondaryCta ? (
              <Link href={compact ? "/" : "/wedding/"} className={styles.buttonSecondary}>
                {page.secondaryCta}
              </Link>
            ) : null}
          </div>
        </div>
        <EventCanvas title={compact ? page.title : "Свадьба Анны и Михаила"} />
      </div>
    </section>
  );
}

function EventCanvas({ title }: { title: string }) {
  return (
    <div className={styles.heroVisual} aria-hidden="true">
      <div className={styles.eventCanvas}>
        <div className={styles.screenPlate}>
          <h2>{title}</h2>
          <p>Сканируйте QR — фотографии появятся здесь</p>
        </div>
        <div className={styles.visualLower}>
          <div className={styles.photoRail}>
            <span className={styles.photoTile} />
            <span className={styles.photoTile} />
            <span className={styles.photoTile} />
          </div>
          <div className={styles.qrPlate}>
            <div className={styles.qrGrid}>
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Workflow({ sections }: { sections: NonNullable<MarketingPage["workflow"]> }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Сценарий проходит по вечеру</h2>
        <p>Страница не начинается с панели настроек. Сначала есть событие, гости и экран, который помогает собрать моменты.</p>
      </div>
      <div className={styles.workflow}>
        {sections.map((section, index) => (
          <article key={section.title} className={styles.stage}>
            <div className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</div>
            <div>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </div>
            <div className={styles.stageVisual} aria-hidden="true">
              <span className={styles.stageLine} />
              <span className={styles.stageLine} />
              <span className={styles.stageLine} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionSet({ page }: { page: MarketingPage }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{page.kind === "home" ? "Что получает организатор" : "Как это устроено"}</h2>
        <p>Короткие сценарии вместо тяжёлой презентации возможностей. Каждая настройка появляется там, где она помогает событию.</p>
      </div>
      <div className={styles.asymmetricGrid}>
        {page.sections.map((section) => (
          <article key={section.title} className={styles.card}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SpecSheet({ specs }: { specs: NonNullable<MarketingPage["specs"]> }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Возможности без витрины функций</h2>
        <p>ФотоЛови продаёт не отдельные кнопки, а понятный запуск мероприятия: QR, экран, доступ, модерация и архив.</p>
      </div>
      <div className={styles.specSheet}>
        {specs.map((spec) => (
          <div key={spec.name} className={styles.specRow}>
            <div className={styles.specName}>{spec.name}</div>
            <div className={styles.specValue}>{spec.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Тарифы без скрытого набора функций</h2>
        <p>Разница между пакетами — количество мероприятий. Основной сценарий сервиса доступен во всех премиум-запусках.</p>
      </div>
      <div className={styles.priceGrid}>
        <article className={styles.priceCard}>
          <span>Тестовое мероприятие</span>
          <strong>30 фото</strong>
          <p>Подходит, чтобы проверить механику на небольшой группе и понять, как гости проходят загрузку.</p>
        </article>
        <article className={styles.priceCard}>
          <span>Премиум-мероприятие</span>
          <strong>500 фото</strong>
          <ul>
            <li>QR-загрузка без приложения</li>
            <li>Экран для проектора</li>
            <li>Настройки доступа гостей</li>
            <li>Обычная модерация и премодерация</li>
            <li>Скачивание фотографий архивом</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function CtaBand({
  title,
  body,
  cta,
  compact = false,
}: {
  title: string;
  body: string;
  cta: string;
  compact?: boolean;
}) {
  return (
    <section className={compact ? styles.ctaBand : `${styles.section} ${styles.ctaBand}`}>
      <div>
        <h2 className={styles.ctaTitle}>{title}</h2>
        <p>{body}</p>
      </div>
      <Link href="/register" className={styles.button}>
        {cta}
      </Link>
    </section>
  );
}

function RelatedLinks({ paths }: { paths: string[] }) {
  if (!paths.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Что ещё посмотреть</h2>
      </div>
      <div className={styles.relatedGrid}>
        {paths.map((path) => {
          const route = getMarketingRoute(path);
          if (!route) return null;

          return (
            <Link key={path} href={getMarketingHref(path)} className={styles.articleCard}>
              <span>{route.pageType}</span>
              <strong>{route.title}</strong>
              <p>{route.intent}</p>
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^а-я0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

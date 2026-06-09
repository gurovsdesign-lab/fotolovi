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

  return <HubPage page={page} route={route} />;
}

function HomePage({ page }: { page: MarketingPage }) {
  return (
    <main className={styles.main}>
      <Hero page={page} />
      {page.workflow ? <Workflow sections={page.workflow} /> : null}
      <SectionSet page={page} />
      {page.specs ? <SpecSheet specs={page.specs} /> : null}
      <Pricing />
      {page.faq ? <Faq items={page.faq} /> : null}
      <CtaBand title="Проверьте live screen на своём событии" body="Создайте мероприятие, покажите QR на экране и посмотрите, как гости превращают свои телефоны в общий поток момента." cta="Создать мероприятие" />
      <RelatedLinks paths={page.related ?? []} />
    </main>
  );
}

function HubPage({ page }: MarketingPageRendererProps) {
  return (
    <main className={`${styles.main} ${styles.articleMain}`}>
      <section className={styles.hubHero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.articleTitle}>{page.title}</h1>
          <p className={styles.lead}>{page.description}</p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.button}>
              {page.primaryCta}
            </Link>
            {page.secondaryCta ? (
              <Link href="/ideas/wedding/" className={styles.buttonSecondary}>
                {page.secondaryCta}
              </Link>
            ) : null}
          </div>
        </div>
        <EditorialNote title="Контентный раздел" body="Здесь собраны сценарии и идеи вокруг продукта, а не отдельная витрина функций." />
      </section>
      <SectionSet page={page} />
      <CtaBand title="Добавьте экран в сценарий события" body="ФотоЛови остаётся аккуратным инструментом внутри вечера: QR, live screen, модерация и архив работают рядом с программой." cta={page.primaryCta} compact />
      <RelatedLinks paths={page.related ?? []} />
    </main>
  );
}

function ArticlePage({ page }: MarketingPageRendererProps) {
  return (
    <main className={`${styles.main} ${styles.articleMain}`}>
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
        <EditorialNote title="Гайд" body="Материал можно читать отдельно от продукта: сначала сценарий, затем аккуратный способ реализовать его на событии." />
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
          <CtaBand title="ФотоЛови как аккуратный слой события" body="QR, live screen, модерация и архив помогают реализовать сценарий из статьи, не превращая праздник в технический брифинг." cta={page.primaryCta} compact />
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
        <h2>Как это работает во время события</h2>
        <p>Сначала есть зал, гости и экран. Техническая механика появляется только там, где помогает людям участвовать.</p>
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
        <h2>{page.kind === "home" ? "Что получает событие" : "Материалы внутри раздела"}</h2>
        <p>{page.kind === "home" ? "Возможности остаются внутри одной продуктовой истории: экран, QR, гости, модерация и архив работают как один вечерний сценарий." : "Эти блоки помогают собрать сценарий, а не продают отдельную функцию как самостоятельную страницу."}</p>
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
        <h2>Основные возможности внутри одного запуска</h2>
        <p>ФотоЛови не дробит историю на отдельные страницы возможностей: продукт ценен как цельный live event experience.</p>
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

function Faq({ items }: { items: NonNullable<MarketingPage["faq"]> }) {
  return (
    <section id="faq" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>FAQ</h2>
        <p>Короткие ответы на вопросы, которые возникают до первого запуска.</p>
      </div>
      <div className={styles.faqGrid}>
        {items.map((item) => (
          <article key={item.question} className={styles.card}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EditorialNote({ title, body }: { title: string; body: string }) {
  return (
    <aside className={styles.editorialNote}>
      <span>{title}</span>
      <p>{body}</p>
    </aside>
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

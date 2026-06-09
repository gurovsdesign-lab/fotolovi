import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getMarketingParent,
  getMarketingHref,
  getMarketingRelatedRoutes,
  type MarketingRoute,
} from "@/lib/marketing/routes";
import { marketingSurface, marketingTypography } from "@/lib/marketing/typography";

export function MarketingPlaceholderPage({ route }: { route: MarketingRoute }) {
  const parent = getMarketingParent(route);
  const relatedRoutes = getMarketingRelatedRoutes(route.path).slice(0, 8);

  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:py-16">
        <div className="grid max-w-3xl gap-4">
          <p className={marketingTypography.eyebrow}>{route.pageType}</p>
          <h1 className={marketingTypography.h1}>{route.title}</h1>
          <p className={marketingTypography.body}>{route.intent}</p>
          <div className="flex flex-wrap gap-2 text-sm text-ml-muted">
            <span className="rounded-md bg-ml-soft px-3 py-1">SEO priority: {route.priority}</span>
            <span className="rounded-md bg-ml-soft px-3 py-1">Level: {route.level}</span>
            <span className="rounded-md bg-ml-soft px-3 py-1">Status: страница в разработке</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <section className={marketingSurface.panel}>
            <h2 className={marketingTypography.h2}>Страница в разработке</h2>
            <p className={`mt-3 ${marketingTypography.small}`}>
              Этот URL уже зарезервирован в marketing/SEO layer, чтобы маршрут не возвращал
              404 и мог участвовать во внутренней перелинковке. Финальный контент,
              визуальная система и SEO-тексты будут добавлены отдельным этапом.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/dashboard" className={marketingSurface.primaryLink}>
                Открыть продукт
              </Link>
              {parent ? (
                <Link href={getMarketingHref(parent.path)} className={marketingSurface.link}>
                  Вернуться: {parent.title}
                </Link>
              ) : null}
            </div>
          </section>

          <aside className={marketingSurface.panel}>
            <h2 className="text-lg font-semibold text-ml-ink">Related links</h2>
            <div className="mt-4 grid gap-2">
              {relatedRoutes.length ? (
                relatedRoutes.map((item) => (
                  <Link
                    key={item.path}
                    href={getMarketingHref(item.path)}
                    className="group flex items-center justify-between gap-3 rounded-md border border-ml-line px-3 py-2 text-sm text-ml-muted transition hover:border-ml-accent hover:text-ml-ink"
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
                  </Link>
                ))
              ) : (
                <p className={marketingTypography.small}>Связанные страницы будут добавлены позже.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { getMarketingPage, isReadyMarketingRoute } from "./content";
import { getMarketingUrl, type MarketingRoute, SITE_ORIGIN } from "./routes";

const DEFAULT_DESCRIPTION =
  "ФотоЛови помогает гостям загружать фото по QR-коду, собирает их в живую галерею и показывает на экране мероприятия.";

export function createMarketingMetadata(route: MarketingRoute): Metadata {
  const canonical = getMarketingUrl(route.path);
  const page = getMarketingPage(route.path);
  const isReady = isReadyMarketingRoute(route);
  const title = route.path === "/" ? "ФотоЛови" : `${route.title} | ФотоЛови`;
  const description = page?.description ?? `${route.intent}. Страница готовится в архитектуре сайта ФотоЛови.`;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description: description || DEFAULT_DESCRIPTION,
    alternates: {
      canonical,
    },
    robots: {
      index: isReady,
      follow: true,
      googleBot: {
        index: isReady,
        follow: true,
      },
    },
    openGraph: {
      title,
      description: description || DEFAULT_DESCRIPTION,
      url: canonical,
      siteName: "ФотоЛови",
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || DEFAULT_DESCRIPTION,
    },
  };
}

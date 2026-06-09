import type { Metadata } from "next";
import { getMarketingUrl, type MarketingRoute, SITE_ORIGIN } from "./routes";

const DEFAULT_DESCRIPTION =
  "FotoLovi помогает гостям загружать фото по QR-коду, собирает их в живую галерею и показывает на экране мероприятия.";

export function createMarketingMetadata(route: MarketingRoute): Metadata {
  const canonical = getMarketingUrl(route.path);
  const title = route.path === "/" ? "ФотоЛови" : `${route.title} | ФотоЛови`;
  const description = `${route.intent}. Страница готовится в рамках SEO-архитектуры FotoLovi.`;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description: description || DEFAULT_DESCRIPTION,
    alternates: {
      canonical,
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
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

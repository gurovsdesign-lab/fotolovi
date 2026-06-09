import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";
import { MarketingPageRenderer } from "@/components/marketing/MarketingPageRenderer";
import { getMarketingPage } from "@/lib/marketing/content";
import { createMarketingMetadata } from "@/lib/marketing/metadata";
import {
  getMarketingPathFromSegments,
  getMarketingRoute,
  MARKETING_ROUTES,
} from "@/lib/marketing/routes";

type MarketingPageParams = {
  params: Promise<{ slug?: string[] }>;
};

export function generateStaticParams() {
  return MARKETING_ROUTES.filter((route) => route.path !== "/").map((route) => ({
    slug: route.path.replace(/^\/|\/$/g, "").split("/"),
  }));
}

export async function generateMetadata({ params }: MarketingPageParams): Promise<Metadata> {
  const { slug } = await params;
  const route = getMarketingRoute(getMarketingPathFromSegments(slug));

  if (!route) return {};

  return createMarketingMetadata(route);
}

export default async function MarketingSeoPage({ params }: MarketingPageParams) {
  const { slug } = await params;
  const route = getMarketingRoute(getMarketingPathFromSegments(slug));

  if (!route) {
    notFound();
  }

  const page = getMarketingPage(route.path);

  return page ? <MarketingPageRenderer route={route} page={page} /> : <MarketingPlaceholderPage route={route} />;
}

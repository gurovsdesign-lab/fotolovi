import type { Metadata } from "next";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";
import { MarketingPageRenderer } from "@/components/marketing/MarketingPageRenderer";
import { getMarketingPage } from "@/lib/marketing/content";
import { createMarketingMetadata } from "@/lib/marketing/metadata";
import { getMarketingRoute } from "@/lib/marketing/routes";

const route = getMarketingRoute("/screen/wedding-screen-ideas/");

export const metadata: Metadata = route ? createMarketingMetadata(route) : {};

export default function WeddingScreenIdeasPage() {
  const page = getMarketingPage("/screen/wedding-screen-ideas/");
  return route && page ? <MarketingPageRenderer route={route} page={page} /> : route ? <MarketingPlaceholderPage route={route} /> : null;
}

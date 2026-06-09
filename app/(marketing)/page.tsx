import type { Metadata } from "next";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";
import { createMarketingMetadata } from "@/lib/marketing/metadata";
import { getMarketingRoute } from "@/lib/marketing/routes";

const route = getMarketingRoute("/");

export const metadata: Metadata = route ? createMarketingMetadata(route) : {};

export default function MarketingHomePage() {
  return route ? <MarketingPlaceholderPage route={route} /> : null;
}

import type { Metadata } from "next";
import { MarketingPlaceholderPage } from "@/components/marketing/MarketingPlaceholderPage";
import { createMarketingMetadata } from "@/lib/marketing/metadata";
import { getMarketingRoute } from "@/lib/marketing/routes";

const route = getMarketingRoute("/screen/what-to-show-on-wedding-projector/");

export const metadata: Metadata = route ? createMarketingMetadata(route) : {};

export default function WhatToShowOnWeddingProjectorPage() {
  return route ? <MarketingPlaceholderPage route={route} /> : null;
}

import type { MetadataRoute } from "next";
import { getMarketingUrl, MARKETING_READY_ROUTES } from "@/lib/marketing/routes";

const priorityBySeoPriority = {
  P0: 0.9,
  P1: 0.75,
  P2: 0.55,
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return MARKETING_READY_ROUTES.map((route) => ({
    url: getMarketingUrl(route.path),
    lastModified: now,
    changeFrequency: route.priority === "P0" ? "weekly" : "monthly",
    priority: route.path === "/" ? 1 : priorityBySeoPriority[route.priority],
  }));
}

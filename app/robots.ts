import type { MetadataRoute } from "next";
import { isReadyMarketingRoute } from "@/lib/marketing/content";
import { getMarketingHref, MARKETING_ROUTES, SITE_ORIGIN } from "@/lib/marketing/routes";

export default function robots(): MetadataRoute.Robots {
  const readyMarketingPaths = MARKETING_ROUTES.filter(isReadyMarketingRoute).map((route) =>
    getMarketingHref(route.path),
  );

  return {
    rules: {
      userAgent: "*",
      allow: readyMarketingPaths,
      disallow: [
        "/api",
        "/admin",
        "/auth",
        "/dashboard",
        "/event",
        "/live",
        "/login",
        "/register",
        "/screen/",
      ],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}

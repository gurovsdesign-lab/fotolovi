import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/marketing/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/screen/what-to-show-on-wedding-projector",
        "/screen/wedding-screen-ideas",
      ],
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

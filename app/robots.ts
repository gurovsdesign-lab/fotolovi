import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/marketing/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/wedding",
        "/qr",
        "/photo",
        "/no-app",
        "/screen",
        "/screen/what-to-show-on-wedding-projector",
        "/screen/wedding-screen-ideas",
        "/hosts",
        "/events",
        "/alternatives",
        "/ideas",
        "/engagement",
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
      ],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}

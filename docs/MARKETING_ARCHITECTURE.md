# Marketing Architecture

FotoLovi keeps the marketing website and the product application in one Next.js app and on one domain.

## Routing Layers

- Marketing layer: `app/(marketing)` plus `components/marketing` and `lib/marketing`.
- Dashboard/product layer: existing product routes under `app/(dashboard)`, `app/(auth)`, `app/admin`, `app/event`, `app/live`, `app/screen`, and `app/api`.
- Shared app shell: `app/layout.tsx` and `app/globals.css`.

## Marketing Foundation

Marketing pages are rendered from `lib/marketing/routes.ts`, which is based on the SEO architecture files in `SEO/`.

The current implementation intentionally renders placeholders only:

- page metadata and canonical URL foundation;
- OpenGraph/Twitter metadata foundation;
- related links from the internal linking graph;
- static params for SSG-ready SEO routes;
- `noindex, follow` metadata for every placeholder route;
- empty sitemap until a marketing route is promoted to a real, indexable page;
- no final copy, hero sections, animations, or visual redesign.

## Product Route Protection

The product owns these namespaces:

- `/dashboard`
- `/admin`
- `/login`
- `/register`
- `/auth`
- `/event`
- `/live`
- `/screen/[slug]`
- `/api`

Marketing uses a catch-all route for SEO placeholders, but product-specific routes remain more specific and keep their existing behavior.

Two SEO pages under `/screen` are declared as explicit static marketing routes:

- `/screen/what-to-show-on-wedding-projector`
- `/screen/wedding-screen-ideas`

This prevents those future SEO URLs from falling through to the product live screen slug route.

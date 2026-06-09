# Marketing Architecture

ФотоЛови keeps the marketing website and the product application in one Next.js app and on one domain.

## Routing Layers

- Marketing layer: `app/(marketing)` plus `components/marketing` and `lib/marketing`.
- Dashboard/product layer: existing product routes under `app/(dashboard)`, `app/(auth)`, `app/admin`, `app/event`, `app/live`, `app/screen`, and `app/api`.
- Shared app shell: `app/layout.tsx` and `app/globals.css`.

## Marketing Foundation

Marketing pages are rendered from `lib/marketing/routes.ts`, which is based on the SEO architecture files in `SEO/`.

The current implementation now has two marketing states:

- ready pages: full marketing content, indexable metadata, sitemap inclusion;
- placeholder routes: reserved routing, internal links, `noindex, follow`, no sitemap inclusion.

The first production marketing pages are:

- `/`
- `/wedding`
- `/wedding/qr-photo-album`
- `/photo/guest-photo-collection`
- `/hosts`
- `/ideas/wedding`
- `/screen/what-to-show-on-wedding-projector`
- `/screen/wedding-screen-ideas`
- `/alternatives/google-drive-telegram`

The visual system lives in `components/marketing/MarketingExperience.module.css` and is scoped to the marketing shell.
It uses the local Hallmark workflow: atmospheric genre, Narrative Workflow macrostructure, N11 mega-menu, Ft5 statement footer,
reusable article layout, reusable CTA bands, category navigation, and token-led styling.

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

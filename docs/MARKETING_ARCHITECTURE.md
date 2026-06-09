# Marketing Architecture

ФотоЛови keeps the marketing website and the product application in one Next.js app and on one domain.

## Routing Layers

- Marketing layer: `app/(marketing)` plus `components/marketing` and `lib/marketing`.
- Dashboard/product layer: existing product routes under `app/(dashboard)`, `app/(auth)`, `app/admin`, `app/event`, `app/live`, `app/screen`, and `app/api`.
- Shared app shell: `app/layout.tsx` and `app/globals.css`.

## Marketing Positioning

The marketing layer is split into two editorial roles:

- `/` is the emotional product landing for the live event experience: QR flow, guest participation, live screen/projector, moderation, archive, pricing, and CTA.
- non-home ready pages are the editorial/SEO ecosystem around the product: ideas, guides, scenarios, projector content, host mechanics, and comparisons.

SEO architecture is a routing foundation, not a signal that every entity becomes a product page. Feature and audience routes can exist as reserved placeholders, but they are not promoted as production pages until they have a real editorial role.

## Marketing Foundation

Marketing pages are rendered from `lib/marketing/routes.ts` and `lib/marketing/content.ts`, with routing informed by the SEO architecture files in `SEO/`.

The current implementation now has two marketing states:

- ready pages: full marketing content, indexable metadata, sitemap inclusion;
- placeholder routes: reserved routing, internal links, `noindex, follow`, no sitemap inclusion.

The first production marketing pages are:

- `/`
- `/wedding`
- `/hosts`
- `/ideas/wedding`
- `/screen/what-to-show-on-wedding-projector`
- `/screen/wedding-screen-ideas`
- `/alternatives/google-drive-telegram`

Reserved feature URLs such as `/wedding/qr-photo-album` and `/photo/guest-photo-collection` remain placeholder/noindex routes for future planning. They are intentionally excluded from the current sitemap and top navigation.

## Navigation Logic

The public marketing navigation is content-led:

- `Свадьбы`
- `Идеи`
- `Проектор`
- `Ведущим`
- `FAQ`

The menu points to ready editorial materials and the homepage FAQ anchor. It does not expose a catalogue of feature pages or a set of audience landing pages.

The visual system lives in `components/marketing/MarketingExperience.module.css` and is scoped to the marketing shell.
It uses the local Hallmark workflow: atmospheric genre, Narrative Workflow macrostructure, N11 mega-menu, Ft5 statement footer,
reusable article layout, reusable CTA bands, category navigation, and token-led styling.

Homepage and editorial pages deliberately use different presentation modes:

- homepage: cinematic product storytelling and live event screen composition;
- articles/hubs: cleaner editorial reading layout, category navigation, contextual CTA, and related materials.

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

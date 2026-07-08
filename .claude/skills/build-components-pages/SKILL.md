---
name: build-components-pages
description: Create or modify Astro components and pages following the site's editorial design system. Use for any change to src/components/, src/pages/, src/layouts/, or src/styles/.
---

# Building components and pages

Full design rationale: `docs/superpowers/specs/2026-05-25-editorial-uplift-design.md`. Hard constraints: static only, no JS frameworks, no new runtime deps, no dark mode.

## Reuse before you build

Current primitives (use these):

| Need | Component |
|---|---|
| Page/section title with eyebrow + rule | `TitleBlock`, `SectionHead`, `OrnamentRule` |
| Buttons/CTAs | `Button` (variants: primary/secondary) |
| Concert on a listing | `ConcertTile` (rich) or `EventRow` (compact) |
| Concert facts card on a detail page | `ConcertCard` |
| Recording/video | `RecordingTile`, `FeaturedRecordings` |
| Person bio | `BioPlate` |
| Service/feature blurb | `ServiceCard`, `FeatureCard` |
| Blog listing entry | `BlogCard` |
| "Nothing here yet" | `EmptyState` |
| CTA band | `EnquiryBand`, `ScholarsCallout` |
| Stripe donation button | `StripeButton` |

Deprecated components (BioCard, Divider, EventCard) have been deleted — don't recreate them.

## Page skeleton

Every page renders through `BaseLayout.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const base = import.meta.env.BASE_URL;
---
<BaseLayout
  title="Page Title"                 <!-- " | Alma Consort" appended automatically -->
  description="150-ish chars for meta/OG"
  ogImage={optionalPath}             <!-- defaults to og-image.png -->
  includeStripe={false}              <!-- true only on pages with Stripe buttons -->
  noindex={false}                    <!-- true for thanks/utility pages -->
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(jsonLd)} />  <!-- only if page-specific schema needed -->
  <div class="container">…</div>
</BaseLayout>
```

BaseLayout already provides: all head meta, canonical, WebPage JSON-LD, Header, **global Breadcrumbs** (never hand-roll one), Newsletter band, Footer.

## Rules

- **Links**: `trailingSlash: 'always'` — internal hrefs end with `/` and are prefixed with `base` (`import.meta.env.BASE_URL`). A missing trailing slash causes a redirect on GitHub Pages.
- **Nav/socials**: `NAV_LINKS` and `SOCIAL_LINKS` come from `src/lib/constants.ts`. Adding a page to the nav = edit that one array. Adding a social profile = edit `SOCIAL_LINKS` (Footer icons and JSON-LD `sameAs` both derive from it).
- **Styles**: scoped `<style>` in the `.astro` file. Use tokens: `var(--color-bg)`, `var(--color-accent)`, `var(--color-heading)`, `var(--color-text-muted)`, `var(--font-serif)`, `var(--font-sans)`, `var(--radius-md)`, `var(--transition)`, etc. (defined in `src/styles/global.css`). Never hardcode brand hex values. Use `:global(...)` only for markdown-rendered content (`.prose :global(p)` pattern).
- **Typography pattern**: small-caps uppercase `eyebrow` (sans, letter-spaced) → serif `h1`/`h2` → italic serif `lede`/`deck`. Copy an existing page's header block rather than inventing spacing.
- **Accessibility**: sections get `aria-labelledby`; decorative images get `alt=""` + `aria-hidden="true"`; interactive elements need `:focus-visible` styles (copy existing).
- **Responsive**: breakpoints in use are `768px` (and occasionally `640px`/`720px`/`1024px`). Grid collapses to single column on mobile.
- **Client JS**: vanilla only, inside `<script>` in the component; keep it smaller than Header's nav-fit script. No new external scripts without an explicit decision.
- **New route?** Also consider: sitemap priority in `astro.config.mjs` (`serialize`), whether it belongs in `NAV_LINKS`, and page-specific JSON-LD (see the seo-and-metadata skill).

Verify with `npm run check && npm run build`, then eyeball via the verify-site skill.

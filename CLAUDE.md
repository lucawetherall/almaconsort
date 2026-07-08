# Alma Consort website

Marketing site for Alma Consort, a professional chamber choir in London directed by Luca Wetherall and Izzy Mohan. Audiences: concert-goers, recording clients (composers/labels/agencies), event bookers, donors, and young singers applying to the Alma Scholars programme. Live at https://www.almaconsort.com.

## Commands

- `npm run dev` — dev server on port 4321
- `npm run check` — typecheck (`astro check`); run before committing
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the built site

## Stack & architecture

Astro 5, fully static (`output: 'static'`), TypeScript strict, no client framework. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main` — plus a **daily 06:00 UTC cron rebuild** that exists to recompute upcoming/past event filtering (dates are compared at build time). Never "fix" an empty upcoming-events state by weakening the date filter.

- `src/pages/` — file-based routes. Dynamic `[slug].astro` routes for `blog/`, `events/`, `support/`. `rss.xml.ts` generates the feed.
- `src/layouts/BaseLayout.astro` — the single page shell. Owns ALL head metadata (title/description/OG/Twitter/canonical/JSON-LD), Header, global Breadcrumbs, Newsletter band, Footer. Props: `title`, `description`, `ogImage`, `ogImageAlt`, `includeStripe`, `noindex`.
- `src/components/` — one-off `.astro` components with scoped `<style>` blocks.
- `src/content/` + `src/content.config.ts` — Zod-validated content collections: `events`, `supportTiers`, `blog`, `featuredRecordings`. See the `add-content` skill for schemas.
- `src/lib/constants.ts` — single source of truth for YouTube URLs, `NAV_LINKS` (Header + Footer), and `SOCIAL_LINKS` (Footer icons + JSON-LD `sameAs`). Hardcoding these anywhere else is a bug.
- `src/styles/global.css` — design tokens (`:root` custom properties) + base styles. Imported once by BaseLayout.
- `public/` — favicons, logos, `og-image.png`, `CNAME`, `robots.txt`, `llms.txt`, `site.webmanifest`.
- `docs/ROADMAP.md` — prioritized improvement backlog with executable briefs.
- `docs/superpowers/specs/2026-05-25-editorial-uplift-design.md` — the full design spec behind the current look.

## Hard constraints (do not violate)

- Static output only; no SSR, no server endpoints.
- No JS frameworks (React/Vue/etc.) and no new **runtime** dependencies. Dev dependencies are fine.
- No dark mode (`color-scheme` is pinned to light).
- Vanilla, minimal client JS only (the nav-fit script in Header is the ceiling of acceptable complexity).

## Design system

- Use tokens from `global.css` — parchment background (`--color-bg`), claret accent (`--color-accent`), Cormorant Garamond (`--font-serif`) + Inter (`--font-sans`). Never hardcode brand colors in components.
- Styling goes in scoped `<style>` blocks inside `.astro` files, not inline `style=` attributes and not new global CSS (tokens excepted).
- Reuse the editorial primitives before writing new markup: `TitleBlock`, `SectionHead`, `OrnamentRule`, `Button`, `ConcertTile`, `EventRow`, `RecordingTile`, `BioPlate`, `EnquiryBand`, `EmptyState`.
- House heading pattern: small-caps `eyebrow` → `h1` → italic `lede`/`deck`. Sections use `aria-labelledby`.

## Conventions & gotchas

- `trailingSlash: 'always'` — every internal link ends with `/` and is prefixed with `import.meta.env.BASE_URL` (aliased to `base` in most files).
- Breadcrumbs are rendered globally by BaseLayout — never hand-roll a per-page breadcrumb.
- **Stripe buy buttons** (Support pages): the script is gated by BaseLayout's `includeStripe` prop; button IDs live in `src/content/support-tiers/*.md`; visual styling is configured in the Stripe Dashboard, not CSS. **Overflow on narrow viewports is a recurring regression** (fixed three separate times) — after touching Support pages, always check ~375px width.
- The contact form posts to Web3Forms using `PUBLIC_WEB3FORMS_KEY` (a GitHub Actions secret). Locally the key is unset and the form silently no-ops — that is not a bug.
- The Zoho newsletter embed and Google Fonts are external dependencies loaded on every page (see ROADMAP for planned changes).
- GA4 is intentionally commented out in BaseLayout pending a real measurement ID (owner decision).
- Homepage `<h1>` is deliberately `visually-hidden` (video hero leads the page).

## Workflow

Work on `claude/<topic>` branches, PR into `main`. Before committing: `npm run check && npm run build`. For deeper verification use the `verify-site` skill. Task-specific guidance lives in `.claude/skills/` (add-content, build-components-pages, verify-site, seo-and-metadata).

---
name: seo-and-metadata
description: Maintain the site's SEO surface — meta tags, Open Graph, JSON-LD structured data, sitemap priorities, robots/llms.txt. Use when adding pages, changing titles/descriptions, adding social profiles, or anything touching structured data.
---

# SEO and metadata

The SEO surface is deliberately thorough for a site this size. Understand what is automatic before adding anything — duplicating schema is worse than omitting it.

## What BaseLayout emits automatically (per page)

`src/layouts/BaseLayout.astro` renders for every page: `<title>` (appends " | Alma Consort" unless already present), meta description, robots (`noindex` prop), canonical URL, full Open Graph + Twitter cards (default image `public/og-image.png`, 1200×630), theme-color `#f7f3e8` (must match `--color-bg` in `global.css` AND `public/site.webmanifest`), and JSON-LD:

- **Homepage only**: `PerformingGroup` (`@id: …#org`) and `WebSite` (`@id: …#website`). `sameAs` is derived from `SOCIAL_LINKS` in `src/lib/constants.ts` — add social profiles there, never inline.
- **Every other page**: a `WebPage` node linked to `#website` and `#org` via `isPartOf`/`about`. Keep this `@id` graph intact — page-level schema should reference those ids rather than redefining the organisation.

`Breadcrumbs.astro` (global) emits `BreadcrumbList` JSON-LD.

## Page-specific structured data

Inject via the head slot:

```astro
<script slot="head" type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

Existing examples to copy from:
- `MusicEvent` — `src/pages/events/[slug].astro` (offers, performers, venue address)
- `BlogPosting` — `src/pages/blog/[slug].astro`
- `VideoObject` — `src/pages/index.astro` and `recording.astro` (currently duplicated with a hardcoded uploadDate — dedup is a ROADMAP item)
- `Service` — `src/pages/recording.astro`
- `MusicEvent` ItemList — `src/pages/events/index.astro` (intentionally suppressed when no upcoming events)

When adding a new content type, pick the closest schema.org type and follow the same pattern: build the object in frontmatter script, conditionally spread optional fields.

## When adding a page

1. Pass an accurate `title` and ~150-char `description` to BaseLayout.
2. Set its sitemap priority/changefreq in `astro.config.mjs` (`sitemap({ serialize })` — routes have explicit priorities; unlisted routes get defaults).
3. Decide `noindex` (utility pages like `/contact/thanks/` are noindexed).
4. Update `public/llms.txt` if the page changes what the site offers (it's a plain-text AI-crawler summary of the org).

## Other fixed points

- `public/robots.txt` allows everything and points at the sitemap.
- RSS feed: `src/pages/rss.xml.ts` (blog only); advertised via `<link rel="alternate">` in BaseLayout.
- `public/CNAME` = www.almaconsort.com — never touch during SEO work.
- Verify JSON-LD after building: `grep -o 'application/ld+json' dist/<page>/index.html | wc -l` and paste the blob into a validator if in doubt.

---
name: add-content
description: Add or edit site content — concert events, blog posts, support tiers, or featured recordings. Use whenever creating/updating markdown in src/content/ so frontmatter matches the Zod schemas and the right structured data gets emitted.
---

# Adding content

All content lives in `src/content/` and is validated at build time by the Zod schemas in `src/content.config.ts`. A schema mismatch fails `npm run build` — check that file first if a build breaks after a content change.

After any content change, run `npm run check && npm run build`.

## Events (`src/content/events/<slug>.md`)

The filename (minus `.md`) becomes the URL: `/events/<slug>/`.

```markdown
---
title: "Concert Title"            # may contain <span class="accent">…</span>
date: 2026-12-20                  # REQUIRED. Drives upcoming/past split (see below)
startTime: "19:30"                # optional, 24h "HH:MM"
endTime: "21:00"                  # optional
venue:
  name: "St Mary's Church"        # required
  address: "Acton, London"        # optional
description: "One or two sentences. Used for meta description and JSON-LD."
ticketUrl: "https://..."          # optional; renders the Book Tickets button
performers:                       # optional; include "…, director" to surface Directed by
  - "Alma Consort"
  - "Luca Wetherall, director"
programme:                        # optional
  - composer: "Victoria"
    work: "O magnum mysterium"
featured: true                    # optional
priceFrom: "£15"                  # optional, shown on the concert card
photo: ./images/concert.jpg       # optional, Astro-optimised image relative to the md file
photoAlt: "Choir performing"      # REQUIRED whenever photo is set (schema refinement)
photoCaption: "…"                 # optional
composers: ["Victoria", "Pärt"]   # optional, listing-page byline
altTitle: "…"                     # optional
---

Body prose rendered on the event page.
```

**Date semantics — important.** Upcoming vs past is computed at **build time** (`date >= new Date()`). A daily 06:00 UTC cron in `.github/workflows/deploy.yml` rebuilds the site so events roll over without commits. Never weaken the date filter to make an empty "Upcoming" section look full — add a future-dated event instead. When there are no future events the homepage and `/events/` intentionally show `EmptyState`, and the MusicEvent ItemList JSON-LD on `/events/` is suppressed.

Each event page emits its own `MusicEvent` JSON-LD (built in `src/pages/events/[slug].astro`) — title, dates, venue, offers come straight from frontmatter, so keep them accurate.

## Blog posts (`src/content/blog/<slug>.md`)

```markdown
---
title: "Post Title"
date: 2026-07-01
description: "Meta description + listing summary."   # required
author: "Alma Consort"                               # optional
tags: ["recording", "process"]                       # optional
---
```

Posts appear on `/blog/`, in the RSS feed (`src/pages/rss.xml.ts`), and emit `BlogPosting` JSON-LD on their page.

## Support tiers (`src/content/support-tiers/<name>.md`)

Route comes from the `slug` frontmatter field (not the filename). Existing tiers: friend, partner, patron.

```yaml
title: "Patron"
slug: "patron"
order: 3                       # sort order on /support/
tagline: "…"                   # card + page lede
cardImage: "…"                 # optional; without it the card shows a plain colour block
stripeButtons:
  - id: "buy_btn_…"            # from the Stripe Dashboard (live mode)
    label: "£500/year"         # internal reference label
    tierName: "Associate Patron"
    price: "£500"
    period: "/ year"           # defaults to "/ month" if omitted
    billingNote: "…"           # optional small print
    highlight: "…"             # optional benefits line
```

The displayed `price` + `period` must agree with what the Stripe button itself shows at checkout — don't display monthly-equivalent maths for annually billed tiers. Button styling is configured in the Stripe Dashboard, not CSS. **After editing support tiers, always verify the page at ~375px width — Stripe buy-button overflow is a recurring regression.**

## Featured recordings (`src/content/featuredRecordings/NN-<slug>.md`)

Frontmatter only (no body): `youtubeId`, `title` (may contain `<span class="accent">…</span>`), `composer`, `order`. Shown on the homepage via `FeaturedRecordings.astro`. YouTube URL/thumbnail helpers live in `src/lib/constants.ts` — never hardcode YouTube URLs.

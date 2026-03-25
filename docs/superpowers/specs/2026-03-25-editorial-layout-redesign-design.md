# Editorial Layout Redesign — Design Spec

## Overview

Redesign the Alma Consort website's homepage and interior page layouts using an editorial/magazine-inspired approach. The existing aesthetic (cream background, Cormorant Garamond, burnt orange accent) is retained; the change is structural — breaking up text-heavy pages with typographic hierarchy, content blocks, and reusable layout components.

## Goals

- Homepage: keep the video prominent, add structured content blocks (events, news, support CTA, newsletter) below it
- Interior pages: replace walls of text with editorial patterns (pull quotes, bio cards, service grids, feature cards)
- Design for photography that will arrive later, but look polished without it
- No changes to header/nav, colour palette, typography choices, or footer stripe

## Scope

### In scope

- Homepage layout restructure
- About page layout (bio cards for directors)
- Scholars page layout (feature cards for event highlights)
- Work With Us page layout (service card grid)
- Recording page layout (pull quote for contact CTA)
- Newsletter placement change (move to base layout, above footer, on every page)
- Footer simplification (remove newsletter, fix Instagram icon)
- New reusable components: Divider, BioCard, ServiceCard, FeatureCard

### Out of scope

- Header/navigation (unchanged)
- Footer colour stripe (unchanged)
- Events index and event detail pages (unchanged)
- Blog index and blog post pages (unchanged)
- Support pages and Stripe integration (unchanged)
- Contact form (unchanged)
- Breadcrumbs (unchanged)
- SEO/structured data (unchanged)
- Base colour palette and typography (unchanged)
- 404 page (unchanged)

## Homepage Redesign

### Current state

Video embed → three paragraphs of text → newsletter signup. Flat, text-heavy, no visual structure.

### New layout (top to bottom)

1. **Video hero** — existing lite-youtube embed, widened from `content-width` (750px) to `site-width` (1100px) for more visual impact.

2. **Introduction** — the existing three paragraphs, centred within `content-width`. The opening paragraph gets a CSS drop cap: `::first-letter` styled as a large Cormorant Garamond character in the accent colour (#c4621c), floated left.

3. **Ornamental divider** — a centred decorative fleuron character (e.g. `✻` or `❧`) in the accent colour. Replaces plain `<hr>` rules.

4. **Two-column grid: Events + News** — within `content-width`, a side-by-side grid:
   - **Left column: "Upcoming Events"** — small-caps heading with accent-coloured bottom border. Lists the next 2–3 events from the `events` collection (date, title, venue). "View all events →" link. If no upcoming events, shows a brief "Check back soon" message.
   - **Right column: "Latest News"** — same heading treatment. Lists the 2–3 most recent posts from the `blog` collection (date, title, truncated description). "Read all news →" link. If no posts, shows a brief placeholder.
   - Falls to single column (stacked) on mobile (≤768px).

5. **Support callout** — a pull quote block: 3px accent-coloured `border-left`, italic text appealing for support of the Alma Scholars programme, with a link to the support page.

6. **Newsletter signup** — the existing Newsletter component, rendered just above the footer. Remove the existing `<Newsletter />` import and `home-newsletter` wrapper from `index.astro`, since the Newsletter is now rendered globally via BaseLayout.

### Dynamic data

The Events and News columns pull from the existing `events` and `blog` content collections at build time, using the same `getCollection()` pattern already used on `events/index.astro` and `blog/index.astro`. No new data sources or APIs.

## Newsletter Placement

### Current state

The Newsletter component appears in two places: the homepage body and the footer (on every page). This creates duplication on the homepage.

### New behaviour

- **Remove** Newsletter from the Footer component entirely.
- **Add** Newsletter to the BaseLayout, rendered between `</main>` and `<Footer />`, so it appears on every page just above the footer.
- The Newsletter component itself is unchanged.

## Footer Simplification

### Current state

Footer contains: nav links, social icons, copyright, newsletter section, colour stripe. The newsletter section adds a second horizontal band that makes the footer feel heavy.

### New footer

- **Remove** the `footer-newsletter` div and its border-top separator.
- **Fix Instagram icon** — the current SVG path data is a fill-based icon being rendered with `fill="none" stroke="currentColor"`, causing it to render as an ugly outlined box. Replace all three social icon SVG paths with consistent, properly rendered icons (either all stroke-based or all fill-based).
- Footer becomes: nav links row, social icons + copyright row, colour stripe. Compact single band.

## Interior Page Patterns

### New reusable components

#### `Divider.astro`

A centred ornamental character (fleuron) in the accent colour. Replaces all `<hr class="section-divider">` and `<hr class="bio-divider">` elements across the site.

```
Props: none
Renders: <div class="divider" aria-hidden="true">✻</div>
Styling: text-align center, accent colour, generous vertical margin (2rem top and bottom), font-size ~1.2rem
```

#### `BioCard.astro`

A two-column card for director biographies.

```
Props:
  name: string (required)
  role: string (optional, e.g. "Director")
  image: string (optional, image path)
  initials: string (optional, fallback when no image)
  bio: string (required, the biography text)

Layout:
  - Image or placeholder on the left (fixed width ~140px)
  - When image provided: displays the photo with border-radius
  - When no image: displays initials on a muted background (e.g. #e8e4db) as a square placeholder
  - Name as small-caps heading, role below in muted text
  - Bio text on the right
  - On mobile (≤768px): stacks vertically, image/placeholder centred above text
```

#### `ServiceCard.astro`

A card for service offerings on the Work With Us page.

```
Props:
  title: string (required)
  description: string (required)
  linkUrl: string (required)
  linkText: string (optional, defaults to "Get in touch →")

Layout:
  - White background card with subtle border (1px solid rgba(60,60,60,0.1))
  - Small-caps title heading
  - Description paragraph
  - Accent-coloured link at the bottom
  - Cards arranged in a 2×2 grid on desktop, single column on mobile
```

#### `FeatureCard.astro`

A content wrapper that visually distinguishes narrative sections.

```
Props:
  none (uses slot for content)

Layout:
  - White background (#fff)
  - Subtle border (1px solid rgba(60,60,60,0.08))
  - Border-radius: 4px
  - Padding: 1.5rem 2rem
  - Margin: 1.5rem 0
  - Content rendered via <slot />
```

### Pull quote styling

Added to `global.css` as a utility class:

```
.pull-quote {
  border-left: 3px solid var(--color-accent);
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: var(--color-text-muted);
}
```

### Page-specific changes

#### About page

- Intro paragraphs (unchanged text)
- New ornamental divider (added between intro and "The Ensemble" — does not exist in current markup)
- "The Ensemble" section (unchanged text)
- Ornamental divider (replaces existing `<hr class="bio-divider">`)
- "Directors" heading
- Two `BioCard` components (Luca Wetherall, Izzy Mohan) — no images initially, using initials as placeholders

#### Scholars page

- Intro paragraphs (unchanged text)
- Ornamental divider (replaces first `<hr>`)
- Valentine's Opera Gala section wrapped in `FeatureCard`
- Ornamental divider (replaces second `<hr>`)
- Christmas at St Mary's section wrapped in `FeatureCard`
- Ornamental divider (replaces third `<hr>`)
- "Supporting the Scholars" section rendered as a pull quote block

#### Work With Us page

- Intro paragraph, optionally with a pull quote for the key sentence
- 2×2 grid of `ServiceCard` components:
  1. Concert Engagements
  2. Recording Sessions
  3. Private & Corporate Events
  4. Weddings & Ceremonies
- Each card contains a condensed version of the current section text (2–3 sentences, not the full paragraphs) with a link to the contact page
- Replaces the current four `<section>` blocks separated by `<hr>` dividers

#### Recording page

- Intro paragraphs and Sessions text (unchanged)
- Ornamental divider (replaces `<hr>`)
- "Our recordings" section with video grid (unchanged)
- Contact CTA rendered as a pull quote block (replaces the plain `<p>` with link)

## CSS Changes

### `global.css` additions

- `.pull-quote` utility class (described above)
- `.drop-cap::first-letter` styling for homepage intro

### No changes to

- CSS custom properties (colours, fonts, widths)
- Base typography rules
- Button styles
- Skip link
- Responsive breakpoints (still 768px and 1024px)

## File changes summary

### New files

- `src/components/Divider.astro`
- `src/components/BioCard.astro`
- `src/components/ServiceCard.astro`
- `src/components/FeatureCard.astro`

### Modified files

- `src/styles/global.css` — add `.pull-quote` and `.drop-cap::first-letter`
- `src/layouts/BaseLayout.astro` — add Newsletter between main and footer
- `src/pages/index.astro` — restructure with video at site-width, drop cap, two-column events/news grid, support callout
- `src/pages/about.astro` — replace `<hr>` with Divider, use BioCard for directors
- `src/pages/scholars.astro` — replace `<hr>` with Divider, wrap events in FeatureCard, support section as pull quote
- `src/pages/work-with-us.astro` — replace sections with ServiceCard grid
- `src/pages/recording.astro` — replace `<hr>` with Divider, contact CTA as pull quote
- `src/components/Footer.astro` — remove newsletter section, fix social icon SVGs

### Unchanged files

- `src/components/Header.astro`
- `src/components/Breadcrumbs.astro`
- `src/components/EventCard.astro`
- `src/components/BlogCard.astro`
- `src/components/ContactForm.astro`
- `src/components/StripeButton.astro`
- `src/components/SupportTierCard.astro`
- `src/pages/events/index.astro`
- `src/pages/events/[slug].astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/support/index.astro`
- `src/pages/support/[slug].astro`
- `src/pages/contact.astro`
- `src/pages/404.astro`
- All content markdown files
- `astro.config.mjs`
- `content.config.ts`

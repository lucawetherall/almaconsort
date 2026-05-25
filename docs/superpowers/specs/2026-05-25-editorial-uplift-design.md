# Editorial Uplift — Design Spec

## Overview

Push the existing editorial direction further: expand the palette with a secondary claret accent, introduce a proper tile system for concerts and recordings, add real photography support across the site (with strong typographic fallbacks), give the homepage an evergreen "Featured Recordings" surface, and replace ad-hoc patterns (ghost links posing as buttons, initials-in-circles for directors, plain bullet lists for events) with consistent components.

The prayer-book / parchment voice stays. The change is in the components, surfaces, and craft — not the personality.

## Goals

- Make every page-level surface able to gracefully host a photograph, without depending on photography being present
- Replace the homepage events bullet list and add an evergreen Featured Recordings section so the front page never feels empty
- Build a real concert tile component with two visually parallel states (photo / no-photo), used consistently on the homepage row and elsewhere
- Replace ghost-link CTAs with a true secondary button so primary/secondary actions sit as a pair
- Refresh the Recording page from prose-on-prose to a real portfolio surface
- Replace the initials-in-circles BioCard with a substantive bio-plate component that supports director photographs (and degrades cleanly without them)
- Introduce a small set of editorial primitives (chapter-opening title block, section head, ornament rule, drop-cap intro, claret-tinted empty-state panel) and use them consistently across every page

## Non-goals

- No change to information architecture, sitemap, URL structure, or routing
- No change to content collections schema beyond additive optional fields
- No change to the multi-colour footer stripe
- No change to RSS, sitemap.xml, or schema.org structured data
- No new runtime dependencies; remain a static Astro site with no JS framework
- No dark mode (out of scope for this round; the parchment palette is the brand)
- No change to the existing logo asset (`public/logo.png`)

## Scope

### In scope

- New design tokens: secondary accent (claret), darkened primary rust, additional surface tones, mobile breakpoint
- New typography pairing: Cormorant Garamond (existing) + Inter (new sans-serif for meta, eyebrows, buttons, nav, body labels)
- New / refreshed components (file paths in §"Component file layout"):
  - `TitleBlock` (chapter-opening) — used on every interior page heading
  - `ConcertTile` (photo + no-photo states)
  - `RecordingTile` (stripped — thumbnail + play button only)
  - `BioPlate` (photo + no-photo states with monogram fallback) — replaces `BioCard`
  - `SectionHead`
  - `EmptyState`
  - `ScholarsCallout` (replaces ad-hoc scholars markup on homepage and About)
  - `EnquiryBand` (recording page footer CTA)
  - `OrnamentRule` (replaces existing `Divider` semantically)
  - `Button.astro` (primary + secondary variants)
  - `FeaturedRecordings` (homepage section)
  - `EventRow` (events list page rows)
  - `ConcertCard` (single-concert sidebar)
  - `ProgrammeList` (single-concert programme)
- Additive optional fields on the `events` collection schema (see §"Content schema changes")
- New optional metadata on the About page for director photo paths
- New `featuredRecordings` content collection
- Header refresh (existing `logo.png` retained, small-caps wordmark + Inter nav links, claret active state)
- Newsletter component visual refresh (input + button adopt new tokens)
- Print-style updates for the new components

### Out of scope

- Site information architecture, navigation, URL structure
- Mailing-list integration / form-submission behaviour
- Server-side rendering changes; everything stays static-built
- Page-specific copy changes beyond the small CTA labels shown in mockups
- Adding individual recording detail pages (recordings link to YouTube — see §"Recording tile destination")

## Visual direction

Editorial direction B from brainstorming — quiet editorial, photography-friendly, parchment palette with deepened rust and claret accents. No ink-black surfaces or full-bleed dark bands. Reads as a serious arts publication, not a parish bulletin.

## Design tokens

All tokens declared on `:root` in `src/styles/global.css`. Existing token names are reused where possible to minimise migration churn; new names are added beside them.

```css
:root {
  /* Colour */
  --color-bg:            #f7f3e8;   /* page parchment (was #f8f5ec) */
  --color-bg-tint:       #f0e8d4;   /* tile plates, panels (NEW) */
  --color-bg-white:      #ffffff;   /* unchanged */
  --color-text:          #2a2620;   /* deepened from #3c3c3c */
  --color-text-muted:    #524a40;
  --color-text-soft:     #6a6660;
  --color-text-light:    #fbf3df;   /* on dark photo overlays (NEW) */
  --color-heading:       #2a2620;
  --color-border:        rgba(60, 40, 20, 0.10);
  --color-border-strong: rgba(60, 40, 20, 0.18);

  --color-accent:        #8b3a0a;   /* deepened from #c4621c */
  --color-accent-hover:  #6e2d07;
  --color-accent-soft:   rgba(139, 58, 10, 0.08);

  --color-claret:        #7a1a2a;   /* NEW secondary accent */
  --color-claret-hover:  #5e1320;
  --color-claret-soft:   rgba(122, 26, 42, 0.05);
  --color-claret-border: rgba(122, 26, 42, 0.35);

  /* Type */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans:  'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Layout widths — unchanged */
  --content-width: 750px;
  --site-width:    1100px;

  /* Breakpoints (NEW) */
  --bp-md: 768px;       /* used in media queries; documented for consistency */
  --bp-lg: 1024px;

  /* Spacing scale — unchanged */
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
  --space-8: 2rem;     --space-10: 2.5rem;  --space-12: 3rem;
  --space-16: 4rem;

  /* Radii — unchanged */
  --radius-sm: 3px;
  --radius-md: 6px;

  /* Shadows */
  --shadow-tile:        0 1px 2px rgba(60, 40, 20, 0.04);
  --shadow-tile-hover:  0 6px 20px rgba(60, 40, 20, 0.08);
  --shadow-play-btn:    0 4px 16px rgba(0, 0, 0, 0.35);
  --shadow-text-on-photo: 0 1px 6px rgba(0, 0, 0, 0.5);

  /* Motion — unchanged */
  --transition: 180ms ease;
  --transition-slow: 280ms ease;
}
```

### Font loading

Inter is loaded from Google Fonts in `BaseLayout.astro` `<head>`, weights **400, 500, 600 only** (≈25 KB total). Existing Cormorant Garamond link remains unchanged. Both loads use `display=swap`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

## Typography

| Role | Family | Weight | Size | Notes |
|---|---|---|---|---|
| Page title (h1) | Cormorant | 500 | 3.4rem desktop / 2.2rem mobile | small-caps, letter-spacing -0.005em, line-height 1 |
| Section heading (h2) | Cormorant | 500 | 1.6rem | small-caps, letter-spacing 0.06em |
| Tile heading (h3) | Cormorant | 500 | 1.25rem | normal case; italic-claret span allowed |
| Body | Cormorant | 400 | 1.1rem | line-height 1.7 |
| Hero pitch / deck | Cormorant italic | 400 | 1.35rem | line-height 1.5, max 50ch |
| Tile meta | Inter | 400 | 0.78rem | line-height 1.55, colour `--color-text-muted` |
| Eyebrow / lead-in | Inter | 500 | 0.7rem | uppercase, letter-spacing 0.18–0.22em, colour `--color-accent` or `--color-claret` |
| Button label | Inter | 500 | 0.72rem | uppercase, letter-spacing 0.16em |
| Nav link | Inter | 400 | 0.72rem | uppercase, letter-spacing 0.16em |
| Form input | Inter | 400 | 0.95rem | line-height 1.3 |
| Caption (on photo) | Cormorant italic | 400 | 0.9rem | colour `--color-text-light` with `--shadow-text-on-photo` |

### Italic-accent rule

In any Cormorant heading, an emphasised phrase is wrapped in `<span class="accent">`:

```css
.accent {
  color: var(--color-claret);
  font-style: italic;
  font-weight: 400;
}
```

Always use this span (not `<em>`). The frame template / global styles do not override class-based rules but may override `<em>`. This rule was validated during brainstorming.

### Drop-cap

The drop-cap is an inline class on a paragraph, not a component:

```html
<p class="drop-cap">The Alma Consort is a professional chamber choir…</p>
```

```css
.drop-cap::first-letter {
  font-family: var(--font-serif);
  font-size: 3.8rem;
  float: left;
  line-height: 0.85;
  margin: 0.06em 0.08em 0 0;
  color: var(--color-accent);
  font-variant: small-caps;
}
@media (max-width: 768px) {
  .drop-cap::first-letter { font-size: 3rem; }
}
```

## Component library

### Header (refactor `src/components/Header.astro`)

- Background: `--color-bg`
- 1px bottom border: `--color-border-strong` (ink-tinted, **not claret**)
- Padding: `1rem 0`
- Brand row (left): existing `logo.png` 38×38 with `border-radius: 50%` + wordmark "Alma Consort" in Cormorant 1.4rem small-caps with letter-spacing 0.1em
- Nav (right): Inter uppercase 0.72rem, letter-spacing 0.16em, gap 1.85rem
- Active state: `color: var(--color-claret)`, with a 1px claret underline rendered 6px below the link
- Hover: `color: var(--color-claret)`, no animation on underline (drop the current scaleX animation — the active treatment is enough signal)
- Existing mobile overflow / hamburger logic in `Header.astro` is retained unchanged
- The "AC" monogram seen in brainstorming mockups was a placeholder — the real `logo.png` is used

### Footer

- Existing footer stripe colours and structure retained
- The standalone `Newsletter.astro` component continues to live above the footer (as set up in previous PR #24)
- Buttons inside the footer and newsletter adopt the new button tokens

### TitleBlock (`src/components/TitleBlock.astro`)

Used on every interior page (About, Recording, Events list, Scholars, Work With Us, Contact, blog index, blog post, 404, etc.).

Props:
- `title: string` (required)
- `pitch?: string` (optional italic deck; supports inline `<span class="accent">` via raw HTML or a slot)

Markup:
```html
<section class="title-block">
  <h1>{title}</h1>
  {pitch && <p class="pitch" set:html={pitch}></p>}
</section>
```

Style:
```css
.title-block {
  padding: 54px 0 30px;
  border-bottom: 1px solid var(--color-border-strong);
  margin: 0 0 var(--space-8);
}
.title-block h1 {
  font-family: var(--font-serif);
  font-size: 3.4rem; line-height: 1;
  font-variant: small-caps;
  letter-spacing: -0.005em;
  font-weight: 500;
  margin: 0 0 18px;
}
.title-block .pitch {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.35rem;
  line-height: 1.5;
  color: var(--color-text-muted);
  max-width: 50ch;
  margin: 0;
}
@media (max-width: 768px) {
  .title-block { padding: 36px 0 22px; }
  .title-block h1 { font-size: 2.2rem; }
  .title-block .pitch { font-size: 1.15rem; }
}
```

Block sits inside the page's existing `.container`; horizontal padding comes from the container.

### OrnamentRule (`src/components/OrnamentRule.astro`)

Drop-in replacement for the current `Divider` component (which can be deprecated — see §"Migration").

```html
<div class="ornament-rule" aria-hidden="true">· · · · ·</div>
```

```css
.ornament-rule {
  text-align: center;
  color: var(--color-accent);
  font-size: 1.1rem;
  letter-spacing: 0.5em;
  padding: 36px 0 30px;
}
```

### SectionHead (`src/components/SectionHead.astro`)

Props:
- `title: string`
- `link?: { href: string, label: string }`

```html
<header class="section-head">
  <h2>{title}</h2>
  {link && <a href={link.href}>{link.label}</a>}
</header>
```

```css
.section-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  border-bottom: 1px solid var(--color-border-strong);
  padding-bottom: 10px;
  margin-bottom: 22px;
}
.section-head h2 {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-variant: small-caps;
  letter-spacing: 0.06em;
  font-weight: 500;
  margin: 0;
}
.section-head a {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
  text-decoration: none;
}
.section-head a:hover { color: var(--color-claret); }
```

### ConcertTile (`src/components/ConcertTile.astro`)

Aspect ratio: 5 / 4 plate, content below. Whole tile is a single `<a>` to the concert detail page.

Props:
- `slug: string`
- `title: string` (may contain `<span class="accent">…</span>`)
- `date: Date`
- `venue: { name: string, address?: string }`
- `startTime?: string`
- `priceFrom?: string` (formatted price string, e.g. `"From £18"`)
- `photo?: ImageMetadata` (Astro Image asset, optional)
- `photoCaption?: string` (defaults to `venue.name` if photo is set and caption is omitted)
- `composers?: string[]` (used in no-photo plate centre)
- `altTitle?: string` (italic alt-title used instead of `composers`)

Rendering rules:
- If `photo` is set → **photo state**
- Else → **no-photo state**
- If `photoCaption` is omitted but `photo` is set → use `venue.name` as the caption
- If both `composers` and `altTitle` are omitted in no-photo state → the centre block renders only the two thin claret rules with no text between them (still presentable)

**Photo state:**
```css
.tile-plate.photo {
  aspect-ratio: 5 / 4;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  background-size: cover;
  background-position: center;
}
.tile-plate.photo::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
}
/* Date top-left, year top-right, caption bottom-left — see brainstorming mocks for exact pixel values */
```

**No-photo state:**
```css
.tile-plate.np {
  aspect-ratio: 5 / 4;
  background: var(--color-bg-tint);
  border: 1px solid var(--color-border-strong);
  display: grid; align-items: center; justify-items: center;
  padding: 38px 22px;
  position: relative;
}
/* Corner date top-left, year top-right (claret-outline pill on parchment), centred composer block with thin claret rules above and below */
```

**Hover (both states):**
```css
.concert-tile a:hover .tile-plate { box-shadow: var(--shadow-tile-hover); }
.concert-tile a:hover h3 { color: var(--color-claret); }
```

**Focus:**
```css
.concert-tile a:focus-visible {
  outline: 2px solid var(--color-claret);
  outline-offset: 3px;
}
```

Title below the plate uses the `.tile-title` heading class (h3); meta line is Inter 0.78rem `--color-text-muted`.

### RecordingTile (`src/components/RecordingTile.astro`)

Aspect ratio: 16 / 9 plate. Stripped — no date, no year, no genre, no duration.

Props:
- `youtubeId: string`
- `title: string` (may contain `<span class="accent">…</span>`)
- `composer: string`
- `href?: string` (defaults to `https://www.youtube.com/watch?v={youtubeId}`; if pointing to YouTube, render the anchor with `target="_blank" rel="noopener"`)

Markup:
- Anchor wraps the whole tile
- Plate background-image is `https://i.ytimg.com/vi/{youtubeId}/maxresdefault.jpg` (always available via YouTube)
- Centred 54px circular play button (parchment background, claret play glyph, `--shadow-play-btn`)
- On hover: play button scales to 1.08 and brightens

**Aspect-ratio rationale:** recording tiles use 16:9 (native YouTube ratio), concert tiles use 5:4. This intentional asymmetry distinguishes content types visually when the two sections appear back-to-back on the homepage.

### BioPlate (`src/components/BioPlate.astro`) — replaces `BioCard`

Aspect ratio: 4 / 5 plate (portrait), bio content below.

Props:
- `name: string` (required, used for `aria-label` and below-plate heading)
- `role: string` (e.g. "Director")
- `roleTags?: string[]` (Inter eyebrow above the bio heading, e.g. `["Director", "Conductor", "Singer"]`)
- `photo?: ImageMetadata` (optional)
- `monogram?: string` (auto-derived if absent: first letter of first name + first letter of last name, uppercase)
- `bio: string | astroHTML` (paragraphs; renders inside `.bio-body`)

Rendering rules:
- If `photo` → photo state with the bottom-darkening overlay
- Else → no-photo state with the centred claret monogram

**Monogram derivation:** if `monogram` prop is not provided, derive from `name` by taking the first letter of the first word and the first letter of the last word, uppercased (e.g. `Luca Wetherall` → `LW`).

**Photo state:**
- `background-position: center 25%` for typical head-and-shoulders crops
- Top-left overlay: role in Inter uppercase, cream
- Bottom-left overlay: name in Cormorant small-caps 1.4rem cream
- Same `::after` legibility overlay as concert tiles

**No-photo state:**
- Flat parchment plate `var(--color-bg-tint)`
- Top-left: role in Inter uppercase deepened-rust
- Top-right: year pill `current year`, claret-outline on parchment — consistent with concert tile pill
- Centred: claret Cormorant monogram 5rem + Cormorant small-caps name 1.15rem + thin claret rule + italic Cormorant 0.92rem supporting line ("Conductor · Singer · Pianist")

Below the plate (both states): Inter `roleTags` joined by " · ", Cormorant 1.8rem name (`<h3>`), then bio body in Cormorant 1rem paragraphs.

Monogram element is `aria-hidden="true"` since the name appears in real text both inside the plate (as the small-caps label beneath the monogram) and below it (as the `<h3>` heading).

### EventRow (`src/components/EventRow.astro`) — events list page

Used for both upcoming and past sections. The `past` variant reduces opacity.

Props:
- All `ConcertTile` props plus `past?: boolean`

Layout:
- CSS Grid `grid-template-columns: 92px 1.4fr 1fr auto`
- Top border on every row (`--color-border-strong`)
- Hover: background `var(--color-claret-soft)`
- Past rows: `opacity: 0.78`; secondary CTA text changes from "Book →" to "Read more →"

### ConcertCard (`src/components/ConcertCard.astro`) — single-concert sidebar

- Bordered parchment panel `1px var(--color-border-strong)`, very subtle vertical wash `linear-gradient(180deg, #fbf8ec, #f5efdf)`
- Date block at top: Cormorant 4rem small-caps day centred, Inter uppercase month/year claret
- Dashed-rule rows below (`border-top: 1px dashed var(--color-border-strong)`): Time, Venue (with quiet sub-address), Tickets (with italic claret "from £18"), Directed by

### ProgrammeList (`src/components/ProgrammeList.astro`)

Props: `items: Array<{ work: string; composer: string; year?: string }>`

Each item: `1fr auto` grid, Cormorant 1.1rem work on the left (with italic-claret accent on the keyword), Inter 0.78rem `composer · year` muted on the right. Items separated by `1px solid var(--color-border)`.

### EmptyState (`src/components/EmptyState.astro`)

Props:
- `title: string` (supports inline `<span class="accent">…</span>` via raw HTML)
- `body?: string`
- `newsletter?: boolean` (default `true`) — when true, renders an Inter input + claret primary "Subscribe" button on the right

Style:
- Background: `repeating-linear-gradient(135deg, transparent 0 8px, rgba(60,40,20,0.025) 8px 9px), rgba(247,243,232,0.4)`
- 1px `--color-border-strong` border
- Grid `1fr auto` on desktop; stacks to one column with `gap: 1rem` below 768px
- Cormorant 1.3rem headline, italic Cormorant 0.95rem supporting body
- When `newsletter={false}`, the right column is omitted and the grid becomes single-column

### ScholarsCallout (`src/components/ScholarsCallout.astro`)

Props:
- `variant?: 'compact' | 'full'` (default `'full'`; compact omits the supporting paragraph and uses a smaller heading; used on homepage)

Style:
- 1px claret border `--color-claret-border`
- Gentle claret-tinted vertical wash `linear-gradient(180deg, var(--color-claret-soft), transparent)`
- Two-column layout (text left, actions right); stacks on mobile
- Inter eyebrow uppercase claret; Cormorant 1.55rem headline ("We mentor early-career singers through the *Alma Scholars* programme.") with italic-claret accent on "Alma Scholars"; italic Cormorant supporting line
- Two CTAs: primary "About the programme" + secondary "How to support"

### EnquiryBand (`src/components/EnquiryBand.astro`) — recording page footer

- 1px top border `--color-border-strong`
- Two-column layout: headline + italic deck on left, primary + secondary CTAs on right
- Headline Cormorant 2.4rem with italic-claret accent on the action word

### Button (`src/components/Button.astro`)

Props: `variant: 'primary' | 'secondary'` (default `'primary'`), `href?: string`, `type?: 'button' | 'submit'`, slot for label, optional `arrow?: boolean` (renders a right arrow that shifts on hover for primary buttons; off by default).

**Primary:**
```css
.btn-primary {
  background: var(--color-claret);
  color: var(--color-bg);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
  padding: 12px 22px;
  border: 1px solid var(--color-claret);
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
}
.btn-primary:hover { background: var(--color-claret-hover); border-color: var(--color-claret-hover); }
.btn-primary:focus-visible { outline: 2px solid var(--color-claret); outline-offset: 3px; }
```

**Secondary (ink outline)** — locked from brainstorming:
```css
.btn-secondary {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
  padding: 12px 22px;
  background: transparent;
  border: 1px solid rgba(42, 38, 32, 0.55);
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
}
.btn-secondary:hover { background: rgba(42, 38, 32, 0.06); border-color: var(--color-text); }
.btn-secondary:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
```

**Existing `StripeButton.astro`** is updated to render with the `.btn-primary` class. Its current bespoke styling is removed.

### Form inputs

Used in Contact, Newsletter, and EmptyState.

```css
.input {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.3;
  padding: 10px 14px;
  background: rgba(247, 243, 232, 0.6);
  border: 1px solid rgba(60, 40, 20, 0.4);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: border-color var(--transition), background var(--transition);
}
.input:focus-visible {
  outline: none;
  border-color: var(--color-claret);
  background: var(--color-bg-white);
}
textarea.input { min-height: 8rem; resize: vertical; }
```

The Contact form's existing structure stays; only input styling and submit-button class change.

### Capabilities row (recording page, inline section)

Three-column grid:
- Inter "01 · Sessions" lead-in in claret
- Cormorant small-caps h3 with 1px claret rule underneath
- Cormorant 1rem paragraph

### Process steps (recording page, inline section)

Two-column layout: left column has small-caps Cormorant heading + italic lede. Right column has stacked steps numbered with roman lowercase (i, ii, iii, iv) in Cormorant small-caps claret 1.6rem, each with Cormorant h3 1.15rem + Inter 0.88rem body paragraph.

### FeaturedRecordings (`src/components/FeaturedRecordings.astro`)

Used on the homepage. Renders a `SectionHead` ("Featured Recordings" + "All recordings →" link pointing to `/recording/`) and three `RecordingTile`s. Always rendered (never empty — if the data source somehow has zero items, the entire section is omitted, but the spec assumes at least three are present). The video-hero caption's "All recordings →" link points to the same `/recording/` URL for consistency.

**Data source:** new content collection `featuredRecordings` at `src/content/featuredRecordings/`. Each entry is a markdown file (or JSON) with frontmatter:
```yaml
youtubeId: 'GjNdZVs7g68'
title: 'O Magnum <span class="accent">Mysterium</span>'
composer: 'Tomás Luis de Victoria'
order: 1
```
The homepage selects the three lowest `order` values, or first three by file order if `order` is omitted. Adding a fourth doesn't break anything — extras are simply unused.

## Page templates

### Homepage (`src/pages/index.astro`)

1. **Video hero** — lite-youtube embed at `--site-width`, no eyebrow/duration framing. Below the video: italic Cormorant caption (work + composer + year) on the left, claret "All recordings →" link on the right, in a `1fr auto` row.
2. **Drop-cap intro paragraphs** (existing copy, preserved). Use the `.drop-cap` class on the first `<p>` only.
3. **OrnamentRule**
4. **Upcoming Concerts**:
   - SectionHead "Upcoming Concerts" + "View all events →"
   - Up to 3 ConcertTiles (sorted by date ascending)
   - When 0 upcoming: render EmptyState with `title="Our next concert hasn't been announced <span class=\"accent\">yet</span>."`, supporting body, `newsletter={true}`
5. **FeaturedRecordings** (always present)
6. **Latest News + Scholars duo**:
   - 2-column grid (`1.2fr 1fr`)
   - Left: news list (three latest posts; Inter 0.7rem claret date column 90px wide + Cormorant 1.05rem title with italic-claret accent)
   - Right: `ScholarsCallout variant="compact"`

**No-video edge case:** if the homepage's featured video ID is somehow unset, render a static "Hero" panel using the no-photo `ConcertTile` plate aesthetic at `--site-width` and 21:9 ratio, with the choir name in centred small-caps and an italic line of copy. This is a defensive fallback; the production homepage is expected to always have a featured video.

### Events list (`src/pages/events/index.astro`)

1. TitleBlock — `title="Concerts & Events"`, no pitch
2. **Upcoming** section: section heading h2 "Upcoming" (no SectionHead component — this is an h2 above EventRows, no right-aligned link). EventRows for each upcoming event. EmptyState when zero (newsletter on).
3. OrnamentRule
4. **Past** section: h2 "Past", EventRows with `past={true}`

### Single concert (`src/pages/events/[...slug].astro`)

1. Breadcrumb (Inter uppercase claret, "Events / This Concert")
2. **Concert hero**: 2-column (`1.1fr 1fr`)
   - Left: Inter eyebrow ("Concert · Saturday 14 March 2026"), Cormorant 3.4rem h1 with italic-claret accent, italic Cormorant deck, action row (primary "Book tickets" with arrow, secondary "Add to calendar")
   - Right: ConcertCard
3. ProgrammeList
4. Programme note prose (Cormorant body)

### Recording (`src/pages/recording.astro`)

1. TitleBlock — `title="Recording"`, `pitch="Studio sessions for composers, producers, and labels — with <span class=\"accent\">in-house audio and video</span>, captured by a team that performs the music too."`
2. **Capabilities** inline three-column row (Sessions · Production · Releases)
3. OrnamentRule
4. **Selected Recordings**: SectionHead + 2×3 RecordingTile grid sourced from `featuredRecordings` collection (limit 6)
5. **How a session works**: process two-column block
6. EnquiryBand

### About (`src/pages/about.astro`)

1. TitleBlock — `title="About"`, `pitch="A professional chamber choir of young London singers — performing <span class=\"accent\">classical, contemporary, jazz, and popular repertoire</span> on the concert platform and in the recording studio."`
2. Drop-cap intro (existing copy)
3. Ensemble paragraph (no second drop cap)
4. OrnamentRule
5. **Directors** section: SectionHead "Directors", two BioPlates side-by-side. Director photos are imported from `src/assets/directors/{slug}.jpg` if present; otherwise the no-photo monogram state renders. Pass `roleTags`, `name`, and `bio` props.
6. ScholarsCallout (full variant)

### Scholars (`src/pages/scholars.astro`)

1. TitleBlock
2. Drop-cap intro
3. Existing content adopts new tokens, OrnamentRule, and new buttons; no structural redesign required this round

### Work With Us (`src/pages/work-with-us.astro`)

1. TitleBlock
2. Existing content adopts new tokens; the existing `ServiceCard.astro` is restyled to match the capabilities-row pattern (Inter lead-in, claret-rule heading, serif body); no structural changes this round

### Contact (`src/pages/contact.astro`)

1. TitleBlock
2. Existing `ContactForm.astro` adopts the new `.input` class and `.btn-primary` submit; field order and labels unchanged

### Blog list (`src/pages/blog/index.astro`) and single blog post

1. TitleBlock on the index
2. Existing `BlogCard.astro` restyled to the EventRow pattern: Inter 0.7rem claret date column, Cormorant 1.35rem title with italic-claret accent, italic Cormorant excerpt, secondary "Read more →" CTA
3. Single-post layout: TitleBlock at top, then existing prose styling

### 404 (`src/pages/404.astro`)

1. TitleBlock — `title="Not found"`
2. Italic Cormorant message
3. Primary button back to home

## Content schema changes

### Events (`src/content.config.ts`)

Add to the events collection schema. All fields optional; existing event documents need no change.

```ts
photo: image().optional(),
photoAlt: z.string().optional(),
photoCaption: z.string().optional(),
composers: z.array(z.string()).optional(),
altTitle: z.string().optional(),
priceFrom: z.string().optional(),  // formatted string, e.g. "From £18"
```

Schema validation: `photoAlt` is required when `photo` is set (enforced with `.refine()` on the schema).

### Featured Recordings (new collection)

```ts
const featuredRecordings = defineCollection({
  type: 'content',
  schema: z.object({
    youtubeId: z.string(),
    title: z.string(),                  // may include <span class="accent">
    composer: z.string(),
    order: z.number().optional(),
  }),
});
```

Three seed entries created from the choir's existing YouTube uploads.

### About — director photos

Director portraits live at `src/assets/directors/luca-wetherall.jpg` and `src/assets/directors/izzy-mohan.jpg`. The About page imports them via Astro's `astro:assets` when present and renders the BioPlate in photo state; falls back to no-photo state with the monogram when the import is not configured.

### Photo asset organisation

- Director portraits: `src/assets/directors/{name-slug}.jpg`
- Event/venue photography: `src/assets/events/{event-slug}.jpg` (referenced from frontmatter `photo` field; processed via Astro Image)
- Recording thumbnails: never stored locally — always fetched from YouTube CDN at `https://i.ytimg.com/vi/{id}/maxresdefault.jpg`

## Component file layout

New files:
```
src/components/
  TitleBlock.astro
  SectionHead.astro
  OrnamentRule.astro
  ConcertTile.astro
  RecordingTile.astro
  BioPlate.astro
  EventRow.astro
  ConcertCard.astro
  ProgrammeList.astro
  EmptyState.astro
  ScholarsCallout.astro
  EnquiryBand.astro
  FeaturedRecordings.astro
  Button.astro
```

Modified files:
- `src/styles/global.css` — token expansion, drop-cap class, accent class, input class, button styles, header refinements
- `src/layouts/BaseLayout.astro` — Inter font load
- `src/components/Header.astro` — refined active state, nav link styling
- `src/components/StripeButton.astro` — render through new `.btn-primary`
- `src/components/Newsletter.astro` — adopt new input + button styles
- `src/components/ContactForm.astro` — adopt new input + button styles
- `src/components/ServiceCard.astro` — restyle to capabilities-row pattern
- `src/components/BlogCard.astro` — restyle to EventRow pattern
- `src/content.config.ts` — add optional event fields, declare new `featuredRecordings` collection
- All page files in `src/pages/` — use new components

Deprecated (kept in place for one release cycle with a `<!-- @deprecated -->` HTML comment at the top of the file, then removed in a follow-up PR):
- `src/components/Divider.astro` (superseded by `OrnamentRule.astro`)
- `src/components/EventCard.astro` (superseded by `ConcertTile.astro` + `EventRow.astro`)
- `src/components/BioCard.astro` (superseded by `BioPlate.astro`)
- `src/components/FeatureCard.astro` (no longer used; verify no remaining references before flagging)
- `src/components/SupportTierCard.astro` — keep, but apply new tokens

## Photography strategy

- Designed for "some usable photos, not a full library". Every tile and bio plate works without a photo and looks intentional, not deficient
- When a photo is added later, no other changes required — set the relevant content field, Astro Image handles processing
- Photo specifications:
  - Concert tile: 5:4 aspect, focal subject in upper-centre, minimum 1000×800 px
  - Recording tile: 16:9 native YouTube thumbnail, no special prep
  - Bio plate: 4:5 portrait, head-and-shoulders, focal point near top third, minimum 800×1000 px
- All photo plates use the legibility-only bottom-darkening overlay; **no decorative gradients exist anywhere in the design system**

## Mobile rhythm

- Single breakpoint at `768px` (token: `--bp-md`)
- All multi-column grids stack to a single column with `gap: 2rem`
- Page title h1 scales to 2.2rem
- Hero pitch scales to 1.15rem
- Concert and recording tile rows stack to a single column; tiles retain their native aspect ratios
- Bio plates stack
- ScholarsCallout becomes single-column; primary and secondary buttons stack vertically with `align-self: start`
- Drop cap reduces to 3rem
- Header collapses to existing hamburger pattern at the same overflow breakpoint (logic in `Header.astro` unchanged)
- EmptyState stacks text and form

## Accessibility

- All claret/cream and claret/parchment combinations meet WCAG AA contrast at the sizes used. Verified: claret on parchment ≥ 4.5:1; deepened rust on parchment ≥ 4.5:1; meta text `--color-text-muted` ≥ 0.78rem on parchment passes AA. Cream on photo (with the legibility overlay) passes at the caption sizes used.
- Tiles, plates, and rows wrapped in a single `<a>`; the entire surface is clickable
- Visible focus rings on every interactive element using `:focus-visible` with 2px claret outline at 3px offset (or 2px ink outline on secondary buttons)
- Photo plate overlays do not rely on hover; text legibility holds for keyboard-only and screen-reader users
- `<span class="accent">` is purely visual; semantic `<em>` may still appear where genuine emphasis is needed
- BioPlate monogram is `aria-hidden="true"`; the director's name appears semantically beneath
- EmptyState text is the primary content of the section, not decoration; it is announced by screen readers
- All `lite-youtube` embeds keep their existing `playlabel` for screen reader announcements
- Skip-link and existing `prefers-reduced-motion` rules in `global.css` are preserved

## Print styles

Append to existing `@media print` block. The new components join the existing hide-list:
- `.tile-plate.photo::after` — hidden (no decorative overlays in print)
- `.empty-state` — hidden (transient prompts don't belong in print)
- `.scholars-callout` — hidden
- `.enquiry-band` — hidden
- `.featured-recordings` — hidden (recordings are video)
- `.ornament-rule` — hidden
- `.btn-primary`, `.btn-secondary` — hidden
- `.section-head a` (right-aligned link) — hidden
- `.tile-plate.np` — keep, but render with `background: none` and a single 1px border; centred composer block visible
- `.concert-card` — keep (useful in print)

## Suggested implementation phases

The writing-plans skill will sequence the work; for orientation:

1. **Tokens + base.** Update `global.css` tokens and base typography. Add Inter font load. Add `.accent`, `.drop-cap`, `.input` classes.
2. **Buttons.** Add `Button.astro`. Update `StripeButton.astro`, `Newsletter.astro`, `ContactForm.astro` to use it.
3. **Primitives.** `TitleBlock`, `SectionHead`, `OrnamentRule`, `EmptyState`, `ScholarsCallout`, `EnquiryBand`. Roll out to every existing page (replace ad-hoc headings, dividers, scholars markup).
4. **Header refresh.** Update `Header.astro` active/hover treatment; keep mobile logic intact.
5. **Tile system.** `ConcertTile`, `RecordingTile`, `BioPlate`. Build no-photo states first (no photo dependency), then layer photo states.
6. **Schema + collections.** Add optional event fields. Create `featuredRecordings` collection with three seed entries.
7. **Homepage.** Replace existing markup with new components; verify both event states (full + empty) and that Featured Recordings always renders.
8. **Events.** Events list page + single concert page (`EventRow`, `ConcertCard`, `ProgrammeList`).
9. **Recording.** Capabilities row, recording tile grid, process block, EnquiryBand.
10. **About.** Drop-cap intro + ensemble paragraph + BioPlate directors + ScholarsCallout.
11. **Secondary pages.** Scholars, Work With Us, Contact, blog list/single, 404 — token + TitleBlock + button adoption.
12. **Print styles + accessibility pass.** Verify focus rings, screen-reader announcements, print rendering of new components.
13. **Deprecation cleanup.** Confirm no remaining references to `Divider`, `EventCard`, `BioCard`, `FeatureCard`; flag with `@deprecated` comments.

## Migration notes

- All design tokens live in `:root` in `global.css`; updating root values affects every component
- The current `Divider.astro` is superseded by `OrnamentRule.astro`; deprecate after migration (one-release lag), do not delete in this PR
- `EventCard.astro` is superseded by `ConcertTile.astro` (homepage) + `EventRow.astro` (events list); deprecate similarly
- `BioCard.astro` is replaced by `BioPlate.astro`; deprecate
- Existing per-page `<style>` blocks should remove all colour and font literals and refer only to tokens. Verify with `grep -rn "#c4621c\|#3c3c3c\|#f8f5ec\|Cormorant Garamond" src/` — only `global.css` should match the font literal; no colour literals should remain in component files
- Inter font load goes in `BaseLayout.astro` `<head>` alongside the existing Cormorant link
- Existing PR #24 polish (focus styles, print styles, skip link, hamburger script) is preserved end-to-end; this spec touches none of those areas except to extend them
- After implementation, run `astro build` and confirm zero CSS-related warnings, plus a clean Lighthouse pass (≥ 95 on all four metrics on homepage and Recording page)

## Risks and trade-offs

- **Brand colour shift.** Changing the primary rust from `#c4621c` to `#8b3a0a` and introducing claret is a brand shift, however subtle. Mitigation: same colour family (warm rust), only deepened; claret is secondary, used sparingly
- **Bandwidth on Inter.** ~25 KB extra; mitigated by `display=swap` and only loading three weights
- **Tile component complexity.** Two distinct visual states per tile (photo / no-photo) means more CSS. Mitigated by sharing the title, meta, and outer-tile structure across both states; only the plate interior differs
- **Photo asset readiness.** Director and event photos are optional. Until they exist, the no-photo states do the work — designed to be presentable on their own merits, not as obvious fallbacks
- **YouTube CDN dependency.** Recording tile backgrounds depend on `i.ytimg.com`. If YouTube changes thumbnail URL format, the tiles fail gracefully (plate shows the parchment background colour through the missing image — play button still renders)

## Open questions

None blocking. All design decisions resolved during brainstorming. Implementation can proceed.

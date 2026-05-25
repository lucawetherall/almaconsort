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
- Introduce a small set of editorial primitives (chapter-opening title block, section head with claret rule, ornament rule, drop-cap intro, claret-tinted empty-state panel) and use them consistently across every page

## Non-goals

- No change to information architecture, sitemap, URL structure, or routing
- No change to content collections schema (events, blog) beyond optional photo fields
- No change to the multi-colour footer stripe
- No change to RSS, sitemap.xml, or schema.org structured data
- No new dependencies; remain a static Astro site with no JS framework

## Scope

### In scope

- New design tokens: secondary accent (claret), darkened primary rust, additional surface tones
- New typography pairing: Cormorant Garamond (existing) + Inter (new sans-serif for meta, eyebrows, buttons, nav)
- New / refreshed components:
  - Chapter-opening title block (used on every page heading)
  - Concert tile (photo + no-photo states)
  - Recording tile (stripped — thumbnail + play button only)
  - Bio plate (photo + no-photo states with monogram fallback)
  - Section head with claret rule
  - Empty-state panel
  - Scholars callout band
  - Enquiry CTA band
  - Primary button (solid claret)
  - Secondary button (ink outline)
  - Featured Recordings homepage section
  - Refreshed event row (events list page)
  - Concert detail card (single concert page sidebar)
  - Programme list (single concert page)
- Optional photo fields on events collection schema
- Optional photo fields and director photo asset path on the About page
- Header refresh (small-caps wordmark + Inter nav links, claret active state)

### Out of scope

- Site information architecture
- Existing pages not touched by the redesign retain their current behaviour: contact, work-with-us, scholars beyond the home/about callout, blog list, single blog post, 404 (these adopt design tokens + new title block but no structural change)
- Newsletter form behaviour / mailing-list integration
- Stripe button styling beyond inheriting button tokens
- Server-side rendering changes; everything stays static

## Visual direction

Editorial direction B from brainstorming — quiet editorial, photography-friendly, parchment palette with deepened rust and claret accents. No ink-black surfaces or full-bleed dark bands. Reads as a serious arts publication, not a parish bulletin.

## Design tokens

```
/* Colour */
--color-bg:            #f7f3e8;   /* page parchment (was #f8f5ec) */
--color-bg-tint:       #f0e8d4;   /* tile plates, panels */
--color-bg-white:      #ffffff;   /* unchanged */
--color-text:          #2a2620;   /* deepened from #3c3c3c */
--color-text-muted:    #524a40;
--color-text-soft:     #6a6660;
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
--font-serif: 'Cormorant Garamond', Georgia, serif;   /* unchanged */
--font-sans:  'Inter', system-ui, -apple-system, sans-serif;   /* NEW */

/* Layout widths — unchanged */
--content-width: 750px;
--site-width:    1100px;

/* Spacing scale — unchanged */
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
--space-8: 2rem;     --space-10: 2.5rem;  --space-12: 3rem;
--space-16: 4rem;

/* Radii — unchanged */
--radius-sm: 3px;
--radius-md: 6px;

/* Shadows */
--shadow-tile: 0 1px 2px rgba(60, 40, 20, 0.04);
--shadow-tile-hover: 0 6px 20px rgba(60, 40, 20, 0.08);
--shadow-play-btn: 0 4px 16px rgba(0, 0, 0, 0.35);

/* Motion — unchanged */
--transition: 180ms ease;
--transition-slow: 280ms ease;
```

Inter is loaded from Google Fonts (weights 400, 500, 600). Cormorant Garamond load is unchanged.

## Typography

| Role | Family | Weight | Size | Notes |
|---|---|---|---|---|
| Page title (h1) | Cormorant | 500 | 3.4rem desktop / 2.2rem mobile | small-caps, letter-spacing -0.005em, line-height 1 |
| Section heading (h2) | Cormorant | 500 | 1.6rem | small-caps, letter-spacing 0.06em |
| Tile heading (h3) | Cormorant | 500 | 1.25rem | normal case, italic claret accent allowed |
| Body | Cormorant | 400 | 1.1rem | line-height 1.7 |
| Hero pitch / deck | Cormorant italic | 400 | 1.35rem | line-height 1.5, max 50ch |
| Tile meta | Inter | 400 | 0.78rem | line-height 1.55, colour --color-text-muted |
| Eyebrow / lead-in | Inter | 500 | 0.7rem | uppercase, letter-spacing 0.18–0.22em, colour --color-accent or --color-claret |
| Button label | Inter | 500 | 0.72rem | uppercase, letter-spacing 0.16em |
| Caption (on photo) | Cormorant italic | 400 | 0.9rem | colour cream with subtle text-shadow |

**Italic accent rule:** in any Cormorant heading, an emphasised phrase is wrapped in `<span class="accent">` and rendered claret + italic + weight 400. Always use the span class (not `<em>`) to avoid global em-tag conflicts.

## Component library

### Header

- Cream background, 1px claret-tinted bottom rule
- Left: 38×38 circular brand mark (radial gradient deepened-rust → dark rust) holding "AC" small-caps cream + small-caps Cormorant wordmark
- Right: horizontal nav links in Inter uppercase, 0.16em tracking, 0.72rem
- Active link: claret colour + 1px claret rule 6px below the link
- Mobile: existing hamburger/overflow behaviour retained from current Header.astro

### Footer

- Existing footer stripe colours retained
- Newsletter and link layout retained
- Buttons inside the footer adopt the new button tokens

### Chapter-opening title block

Used on every interior page (About, Recording, Events list, Scholars, Work With Us, Contact, blog index, 404, etc.).

```
[padding: 54px 0 30px]
  h1 small-caps Cormorant 3.4rem
  p.pitch italic Cormorant 1.35rem (max 50ch) — optional
[border-bottom: 1px solid --color-border-strong]
```

No two-column layouts. No meta column on the right. Pure stacked, left-aligned.

### Drop-cap intro

First content paragraph after a title block. `:first-letter` styled at 3.8rem in small-caps Cormorant, colour `--color-accent`, floated left with appropriate margins. Existing pattern, preserved.

### Ornament rule

`· · · · ·` centred, colour `--color-accent`, font-size 1.1rem, letter-spacing 0.5em, padding 36px 0 30px. Used as a section transition between major content blocks where a full section-head would be too heavy.

### Section head

```
[grid: 1fr auto, baseline-aligned]
  h2 small-caps Cormorant 1.6rem
  a → "View all events →" Inter uppercase claret
[border-bottom: 1px solid --color-border-strong, padding-bottom: 10px, margin-bottom: 22px]
```

### Concert tile (NEW)

Aspect ratio: 5 / 4 plate, content below.

**Photo state.**
- Background-image fills the plate, `background-size: cover`
- `::after` pseudo-element: `linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)` — purely for caption legibility, no decorative gradient
- Top-left: date overlay (Cormorant small-caps day 1.9rem + Inter month 0.7rem) in cream `#fbf3df` with `text-shadow: 0 1px 6px rgba(0,0,0,0.5)`
- Top-right: year pill — Inter 0.7rem, cream text, translucent dark background with cream 1px border
- Bottom-left/right: italic Cormorant caption in cream

**No-photo state.**
- Solid flat background: `var(--color-bg-tint)`, no gradient, no paper grain
- Top-left: corner date — Cormorant small-caps day 2.1rem in ink + Inter month 0.7rem in deepened-rust
- Top-right: year pill — Inter 0.7rem claret outline, parchment translucent background
- Centred vertically: composer block — thin claret rule (36px × 1px) + Cormorant 1.2rem composer names stacked one per line + thin claret rule. For events without a composer list, swap to a single italic Cormorant 1.05rem sentence (alt-title variant).
- Title and meta sit beneath the plate (not on it).

Below plate (both states):
- `h3.tile-title` Cormorant 1.25rem with optional `<span class="accent">` for italic claret accent
- Inter meta line 0.78rem, --color-text-muted

### Recording tile (NEW)

Aspect ratio: 16 / 9 plate. Stripped — no date, no year, no genre, no duration.

- Background-image is the YouTube thumbnail (`https://i.ytimg.com/vi/{id}/maxresdefault.jpg`)
- Centred play button: 54px circle, parchment background, claret play glyph, `--shadow-play-btn`
- On hover, the play button scales to 1.08 and the background brightens
- No overlays, no captions on the plate
- Below the plate: same `h3.tile-title` Cormorant + Inter meta pattern as concert tiles

The lite-youtube embed component continues to be used inside any tile that should embed-and-play in place (e.g. on the Recording page detail view if added later). The tile by default links to a recording page or external YouTube link.

### Bio plate (NEW — replaces current BioCard)

Aspect ratio: 4 / 5 plate (portrait), bio content below.

**Photo state.**
- Background-image (director portrait), `background-position: center 25%` for typical head-and-shoulders crop
- Same caption-legibility gradient as concert tile
- Top-left: role in Inter uppercase cream
- Bottom-left: name in Cormorant small-caps 1.4rem cream

**No-photo state.**
- Flat parchment plate `var(--color-bg-tint)`
- Top-left: role in Inter uppercase deepened-rust
- Top-right: year pill (Inter claret outline) — consistent with concert tile pill
- Centred: large claret Cormorant monogram (e.g. "LW") at 5rem + Cormorant small-caps name at 1.15rem + thin claret rule + italic Cormorant 0.92rem supporting line

Below the plate (both states): Inter meta line (role tags), Cormorant 1.8rem name, two short Cormorant body paragraphs.

### Event row (events list page)

Grid: `92px 1.4fr 1fr auto`, full-width rows with top borders, on hover gets a `--color-claret-soft` background.

- Date column: Cormorant day 2rem + Inter month uppercase claret + Inter year quiet
- Title column: Cormorant 1.35rem title with italic claret accent + italic Cormorant excerpt
- Venue column: Inter venue name (medium weight) + Inter address (quiet) + Inter time (claret)
- CTA column: secondary button ("Book →" for upcoming, "Read more →" for past)

Past events: row opacity 0.78, CTA in soft ink instead of claret.

### Concert detail card (single concert sidebar)

- Bordered parchment panel `1px var(--color-border-strong)`, very subtle vertical wash
- Date block at top: Cormorant 4rem small-caps day centred, Inter uppercase month/year claret
- Dashed-rule rows below: Time, Venue (with quiet sub-address), Tickets (with italic claret "from £18"), Directed by

### Programme list

Each piece is a row with `1fr auto` grid:
- Left: work title in Cormorant 1.1rem with italic accent for the keyword
- Right: composer + year in Inter 0.78rem muted

Items separated by `1px solid var(--color-border)`.

### Empty-state panel

Used wherever a section has no items (Upcoming Concerts when no events, etc.).

- Cross-hatched parchment background: `repeating-linear-gradient(135deg, transparent 0 8px, rgba(60,40,20,0.025) 8px 9px)` over `rgba(247,243,232,0.4)`
- 1px `--color-border-strong` border
- Two-column grid (text left, optional newsletter form right) or single-column on mobile
- Cormorant 1.3rem headline with italic claret emphasis ("Our next concert hasn't been announced *yet*.")
- Italic Cormorant supporting sentence
- Optional inline newsletter form: Inter input + claret primary button, no rounded corners

### Scholars callout band

- 1px claret border, gentle claret-tinted vertical wash background `linear-gradient(180deg, var(--color-claret-soft), transparent)`
- Two-column layout (text left, actions right); stacks on mobile
- Inter eyebrow uppercase claret, Cormorant 1.55rem headline with italic claret emphasis on "Alma Scholars", italic Cormorant supporting line, two CTAs (primary + secondary)

### Enquiry CTA band (recording page)

- 1px top border
- Two-column layout, headline + italic deck on left, primary + secondary CTAs on right
- Headline Cormorant 2.4rem with italic claret accent on the action word

### Capabilities row (recording page)

Three-column grid:
- Inter "01 · Sessions" lead-in in claret
- Cormorant small-caps h3 with 1px claret rule underneath
- Cormorant 1rem paragraph

### Process steps (recording page)

Two-column layout: left column has small-caps Cormorant heading + italic lede. Right column has stacked steps numbered with roman lowercase (i, ii, iii, iv) in Cormorant small-caps claret, each with Cormorant h3 + Inter body paragraph.

### Buttons

**Primary**
```
background: var(--color-claret)
color: var(--color-bg)
font-family: var(--font-sans)
font-size: 0.72rem
letter-spacing: 0.16em
text-transform: uppercase
padding: 12px 22px
border: 1px solid var(--color-claret)
:hover { background: var(--color-claret-hover) }
```

**Secondary (ink outline)** — locked from brainstorming
```
color: var(--color-text)
font-family: var(--font-sans)
font-size: 0.72rem
letter-spacing: 0.16em
text-transform: uppercase
padding: 12px 22px
background: transparent
border: 1px solid rgba(42, 38, 32, 0.55)
:hover { background: rgba(42, 38, 32, 0.06); border-color: var(--color-text) }
```

Keeps the primary as the only claret element in any action group, preserving claret as a high-signal colour.

**Stripe / external-action buttons** inherit the primary token. The current `StripeButton.astro` adopts the primary class.

### Featured Recordings (homepage section)

Section head ("Featured Recordings", "All recordings →" link) above a three-tile row of recording tiles. Always present — carries the homepage when no concerts are on the schedule.

## Page templates

### Homepage (`src/pages/index.astro`)

1. Video hero — lite-youtube embed at `--site-width`, no eyebrow/duration framing. Below the video: italic Cormorant caption (work + composer + year) + claret "All recordings →" link, in a `1fr auto` row.
2. Drop-cap intro paragraphs (existing copy, preserved)
3. Ornament rule
4. **Upcoming Concerts** section:
   - Section head + "View all events →" link
   - Three concert tiles (full state) — when 1 or 2 concerts exist, the empty tiles in the row are omitted, not padded
   - Empty state: when there are zero upcoming concerts, render the empty-state panel with the inline newsletter form
5. **Featured Recordings** section (NEW):
   - Section head + "All recordings →" link
   - Three recording tiles, always present
6. **Latest News + Scholars** duo:
   - Two-column grid (1.2fr / 1fr)
   - Left: news list (three latest posts, Inter date column + Cormorant title with italic accent)
   - Right: scholars callout band (compact variant)

The hero, intro, ornament, and recordings section never depend on event data. The page never appears empty.

### Events list (`src/pages/events/index.astro`)

1. Chapter-opening title block (h1 "Concerts & Events")
2. **Upcoming** section: event rows; empty state if zero rows
3. Ornament rule
4. **Past** section: event rows with `opacity: 0.78`, secondary CTA goes to "Read more →"

### Single concert (`src/pages/events/[...slug].astro`)

1. Breadcrumb (Inter uppercase, "Events / This Concert")
2. Concert hero: 2-column (1.1fr / 1fr)
   - Left: Inter eyebrow ("Concert · Saturday 14 March 2026"), Cormorant 3.4rem h1 with italic claret accent, italic Cormorant deck, action row (primary "Book tickets" + secondary "Add to calendar")
   - Right: concert detail card (sidebar)
3. Programme list
4. Programme note prose

### Recording (`src/pages/recording.astro`)

1. Chapter-opening title block (h1 "Recording", pitch with italic claret accent)
2. Capabilities three-column row
3. Ornament rule
4. **Selected Recordings** section: 2×3 recording-tile grid
5. **How a session works**: process two-column block
6. Enquiry CTA band

### About (`src/pages/about.astro`)

1. Chapter-opening title block
2. Drop-cap intro (existing copy)
3. Ensemble paragraph
4. Ornament rule
5. **Directors** section: two bio plates side-by-side, each with photo or no-photo state, bio body below
6. Scholars callout band (full variant)

### Scholars (`src/pages/scholars.astro`)

1. Chapter-opening title block
2. Drop-cap intro
3. Existing content adopts new tokens + section-head pattern; no structural redesign required this round
4. Apply new buttons throughout

### Work With Us (`src/pages/work-with-us.astro`)

1. Chapter-opening title block
2. Existing content adopts new tokens; ServiceCard component restyled to match the capabilities-row pattern (Inter lead-in, claret-rule heading, serif body); no other structural changes this round
3. Apply new buttons throughout

### Contact (`src/pages/contact.astro`)

1. Chapter-opening title block
2. Existing ContactForm adopts new input/button tokens (Inter input, claret primary submit)
3. No structural redesign this round

### Blog list (`src/pages/blog/`) and single blog post

1. Chapter-opening title block on the index
2. Existing BlogCard component restyled to match the editorial event-row pattern (Inter date, Cormorant title with italic accent, italic excerpt)
3. Single-post layout adopts new title-block pattern and tokens; prose styling unchanged

### 404 (`src/pages/404.astro`)

1. Chapter-opening title block ("Not found")
2. Italic Cormorant message
3. Primary button back to home

## Content schema changes

### Events (`src/content/events/`)

Add optional fields to the events collection schema:

```
photo?: string         /* path to image asset (relative to /public or imported) */
photoAlt?: string      /* required if photo is set */
photoCaption?: string  /* optional italic caption overlay on the tile */
composers?: string[]   /* short list rendered in no-photo plate centre */
altTitle?: string      /* italic alt-title sentence used instead of composers */
```

All optional. Existing event documents need no change. When neither `composers` nor `altTitle` is set on a no-photo tile, the plate centre is empty except for the small claret rules — still presentable.

### About — director photos

Director portraits live at `src/assets/directors/luca.jpg` and `src/assets/directors/izzy.jpg`. The About page imports them when present and renders the bio plate in photo state; falls back to no-photo state with the monogram (initials) when imports fail or files are missing.

## Photography strategy

- Concerts and bios are designed for "some usable photos, not a full library". Every tile and bio plate works without a photo and looks intentional, not deficient.
- When a photo is added later, no other changes required — just set the relevant content field.
- Photo specifications:
  - Concert tile: 5:4 aspect, focal subject in upper-centre, minimum 1000×800 px
  - Recording tile: 16:9 native YouTube thumbnail, no special prep
  - Bio plate: 4:5 portrait, head-and-shoulders, focal point near top third, minimum 800×1000 px
- All photo plates use the legibility-only bottom-darkening overlay. No decorative gradients are used anywhere in the design system.

## Mobile rhythm

- Below 768px, all multi-column grids stack to a single column with `gap: 2rem`
- Page title h1 scales to 2.2rem
- Concert and recording tile rows stack to a single column; tiles retain their 5:4 / 16:9 ratios
- Bio plates stack to a single column
- Scholars callout becomes single-column; primary and secondary buttons stack vertically with `align-self: start`
- Drop cap reduces to 3rem
- Header collapses to existing hamburger pattern at the same overflow breakpoint
- Empty-state panels stack the text and the newsletter form

## Accessibility

- All claret/cream and claret/parchment combinations meet WCAG AA contrast at the sizes used (verified for 1rem and above; meta text in `--color-text-muted` meets AA against parchment at all sizes ≥ 0.78rem)
- All tile components are wrapped in `<a>` with the entire tile clickable; visible focus uses 2px solid claret outline at 3px offset
- Photo plate overlays do not rely on hover; text legibility holds for keyboard-only and screen-reader users
- `<span class="accent">` is purely visual; semantic emphasis where required uses real `<em>` tags inside or alongside it (a heading like "Lenten <span class="accent">Vespers</span>" reads naturally without emphasis)
- Bio plate monogram is `aria-hidden`; the director's name appears semantically beneath
- Empty-state panel text is the primary content of the section, not decoration; it is announced by screen readers

## Migration notes

- All design tokens live in `src/styles/global.css` `:root`; updating the root affects every component
- The current Divider component is superseded by the ornament rule; deprecate after migration, do not delete the file yet
- Current EventCard is superseded by the new concert tile + event row components; deprecate after migration
- Current BioCard is replaced by the bio plate component
- Existing per-page `<style>` blocks should remove any colour or font literals and refer only to tokens
- The deepened rust (`--color-accent`) replaces every existing use of `#c4621c` site-wide; no per-page colour overrides should remain
- Inter font load goes in BaseLayout `<head>` alongside the existing Cormorant link
- Existing PR #24 polish work (focus styles, print styles, skip link, hamburger script) is preserved; this spec touches none of those areas

## Risks and trade-offs

- **Brand colour shift.** Changing the primary rust from `#c4621c` to `#8b3a0a` and introducing claret is a brand shift, however subtle. Mitigation: the change keeps the same colour family (warm rust), only deepened, and the claret is introduced as a secondary, used sparingly.
- **Bandwidth on Inter.** A second webfont adds ~25KB. Inter is widely used and likely cached; load three weights only.
- **Tile component complexity.** Two distinct visual states (photo / no-photo) means more CSS to maintain. Mitigated by sharing the title, meta, and outer-tile structure across both states; only the plate interior differs.
- **Empty-state newsletter.** The empty-state panel includes a newsletter form by default. If the user prefers a quieter empty state without a form, the form region is optional and can be omitted via a prop.
- **Photo asset readiness.** Director photos and concert/venue photography are optional. Until they exist, the no-photo states do the work — they are designed to be presentable on their own merits, not as obvious fallbacks.

## Open questions

None blocking. All design decisions resolved during brainstorming. Implementation can proceed.

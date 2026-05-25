# Editorial Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the editorial uplift redesign — new design tokens (deepened rust + claret + Inter), a tile system for concerts/recordings/bios with photo/no-photo states, an evergreen Featured Recordings surface on the homepage, refreshed Recording and About pages, and a consistent set of editorial primitives (TitleBlock, SectionHead, OrnamentRule, EmptyState, ScholarsCallout, EnquiryBand) applied across every page.

**Architecture:** Astro 5 static site, no JS framework. New Astro components in `src/components/`. Tokens centralised in `:root` in `src/styles/global.css`. Brand-level constants (YouTube channel URL, helpers) in `src/lib/constants.ts`. Content schema extended additively. Existing `Divider`, `EventCard`, `BioCard`, `FeatureCard` deprecated (kept one cycle, then removed in a follow-up). All photo plates use the same legibility-overlay pattern; all no-photo plates use the same flat parchment + corner-date + centred-typography pattern. No decorative gradients anywhere.

**Tech Stack:** Astro 5.18, TypeScript (for `constants.ts` + schema), Zod (existing — content schema). New webfont: Inter (Google Fonts, weights 400/500/600). Existing: Cormorant Garamond, `@astrojs/rss`, `@astrojs/sitemap`. No new runtime dependencies.

**Verification model:** Static-site project with no test framework. Each task ends with `npm run build` (which runs `astro check` implicitly via Astro's build pipeline) and a visual check in `npm run dev` against the relevant page. The "Verification checklist" at the end of the spec is the gate before considering the work done.

**Spec:** `docs/superpowers/specs/2026-05-25-editorial-uplift-design.md` is authoritative. If the plan and spec conflict, the spec wins — flag and revise the plan rather than diverging silently.

---

## File structure overview

### New files
```
src/lib/
  constants.ts                       # Brand constants (YouTube URLs/helpers)

src/components/
  Button.astro                       # Primary + secondary variants
  TitleBlock.astro                   # Chapter-opening h1 + optional italic pitch
  SectionHead.astro                  # h2 + optional right-aligned link
  OrnamentRule.astro                 # Centred · · · · · separator
  EmptyState.astro                   # Cross-hatch panel with optional form
  ScholarsCallout.astro              # Claret-bordered band, compact + full variants
  EnquiryBand.astro                  # Recording page footer CTA band
  ConcertTile.astro                  # 5:4 plate, photo + no-photo states
  RecordingTile.astro                # 16:9 YouTube thumb + play button
  BioPlate.astro                     # 4:5 plate, photo + monogram states
  EventRow.astro                     # Events list page row
  ConcertCard.astro                  # Single concert sidebar
  ProgrammeList.astro                # Programme work/composer list
  FeaturedRecordings.astro           # Homepage section wrapping 3 RecordingTiles

src/content/featuredRecordings/
  01-o-magnum-mysterium.md           # Seed entry 1
  02-<second>.md                     # Seed entry 2
  03-<third>.md                      # Seed entry 3
```

### Modified files
```
src/styles/global.css                # Token expansion, utility classes, print updates
src/layouts/BaseLayout.astro         # Inter font preload
src/content.config.ts                # Add optional event fields, declare featuredRecordings collection
src/components/Header.astro          # Refined nav: claret active, no animated underline
src/components/Newsletter.astro      # Inputs + button use new tokens
src/components/ContactForm.astro     # Inputs + submit use new tokens
src/components/StripeButton.astro    # Render via .btn-primary
src/components/ServiceCard.astro     # Restyle to capabilities-row pattern
src/components/BlogCard.astro        # Restyle to EventRow pattern
src/pages/index.astro                # New homepage composition
src/pages/events/index.astro         # TitleBlock + EventRows
src/pages/events/[slug].astro        # TitleBlock + new hero + ConcertCard + ProgrammeList
src/pages/recording.astro            # TitleBlock + capabilities + recordings grid + process + EnquiryBand
src/pages/about.astro                # TitleBlock + intro + BioPlates + ScholarsCallout
src/pages/scholars.astro             # TitleBlock + token adoption
src/pages/work-with-us.astro         # TitleBlock + token adoption
src/pages/contact.astro              # TitleBlock + token adoption
src/pages/blog/index.astro           # TitleBlock + new BlogCard
src/pages/blog/[slug].astro          # TitleBlock + token adoption
src/pages/404.astro                  # TitleBlock + primary button home
```

### Deprecated (kept with `@deprecated` comment for one cycle)
```
src/components/Divider.astro         # Superseded by OrnamentRule
src/components/EventCard.astro       # Superseded by ConcertTile + EventRow
src/components/BioCard.astro         # Superseded by BioPlate
src/components/FeatureCard.astro     # Confirm no remaining refs, then deprecate
```

### New asset directories (no files created here yet — directories ready for future photos)
```
src/assets/directors/                # luca-wetherall.jpg, izzy-mohan.jpg (when supplied)
src/assets/events/                   # {event-slug}.jpg (when supplied)
```

---

## Phase 1 — Tokens, font load, utility classes, constants

### Task 1: Update design tokens in `global.css`

**Files:**
- Modify: `src/styles/global.css` (lines 1–55 — the `:root` block)

- [ ] **Step 1: Replace the `:root` block**

Replace the entire `:root { … }` block at the top of `src/styles/global.css` with:

```css
:root {
  /* Colour */
  --color-bg:            #f7f3e8;
  --color-bg-tint:       #f0e8d4;
  --color-bg-white:      #ffffff;
  --color-text:          #2a2620;
  --color-text-muted:    #524a40;
  --color-text-soft:     #6a6660;
  --color-text-light:    #fbf3df;
  --color-heading:       #2a2620;
  --color-border:        rgba(60, 40, 20, 0.10);
  --color-border-strong: rgba(60, 40, 20, 0.18);

  --color-accent:        #8b3a0a;
  --color-accent-hover:  #6e2d07;
  --color-accent-soft:   rgba(139, 58, 10, 0.08);

  --color-claret:        #7a1a2a;
  --color-claret-hover:  #5e1320;
  --color-claret-soft:   rgba(122, 26, 42, 0.05);
  --color-claret-border: rgba(122, 26, 42, 0.35);

  /* Type */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans:  'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Layout widths */
  --content-width: 750px;
  --site-width:    1100px;

  /* Breakpoints (documentation only — actual media queries hardcode the px value) */
  --bp-md: 768px;
  --bp-lg: 1024px;

  /* Spacing scale */
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
  --space-8: 2rem;     --space-10: 2.5rem;  --space-12: 3rem;
  --space-16: 4rem;

  /* Radii */
  --radius-sm: 3px;
  --radius-md: 6px;

  /* Shadows */
  --shadow-tile:          0 1px 2px rgba(60, 40, 20, 0.04);
  --shadow-tile-hover:    0 6px 20px rgba(60, 40, 20, 0.08);
  --shadow-play-btn:      0 4px 16px rgba(0, 0, 0, 0.35);
  --shadow-text-on-photo: 0 1px 6px rgba(0, 0, 0, 0.5);

  /* Legacy aliases — temporarily kept so existing component styles still resolve.
     Remove in the migration cleanup task. */
  --shadow-card:        var(--shadow-tile);
  --shadow-card-hover:  var(--shadow-tile-hover);

  /* Motion */
  --transition: 180ms ease;
  --transition-slow: 280ms ease;

  /* Footer stripe colours — unchanged */
  --stripe-blue:   #4a7fb5;
  --stripe-teal:   #5bb5a2;
  --stripe-yellow: #f0c75e;
  --stripe-coral:  #e8765a;
  --stripe-pink:   #d65b8a;
}
```

- [ ] **Step 2: Build & verify nothing broke**

Run: `npm run build`
Expected: build succeeds. The site will look slightly different already (deepened palette) but nothing should error.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Update palette tokens for editorial uplift

Deepen primary rust to #8b3a0a, deepen ink-on-cream text to #2a2620,
add claret secondary accent #7a1a2a, surface tones, text-on-photo
helpers, and a sans-serif token. Legacy shadow aliases preserved so
existing component styles continue to resolve until they are migrated."
```

---

### Task 2: Load Inter font in BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (the `<head>` section)

- [ ] **Step 1: Find the existing Cormorant `<link>` tag in BaseLayout.astro**

Run: `grep -n 'Cormorant\|fonts.googleapis' src/layouts/BaseLayout.astro`

Expected output shows one or two `<link>` tags loading Cormorant Garamond from Google Fonts.

- [ ] **Step 2: Replace the font load with the combined Cormorant + Inter request**

Replace the existing Google Fonts `<link>` lines in `BaseLayout.astro` `<head>` with:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

If a `preconnect` to `fonts.gstatic.com` already exists, do not duplicate it.

- [ ] **Step 3: Build & verify**

Run: `npm run build && npm run dev`
Open the homepage in a browser. Verify in DevTools → Network that:
- `fonts.googleapis.com/css2?family=Cormorant+Garamond:…&family=Inter:…` returns 200
- Inter weights 400, 500, 600 are downloaded (the woff2 requests appear)

No layout shift should be visually apparent because no styles use `--font-sans` yet.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Load Inter font alongside Cormorant Garamond"
```

---

### Task 3: Add utility classes to `global.css`

**Files:**
- Modify: `src/styles/global.css` (append to end, or insert in a logical section)

- [ ] **Step 1: Add the `.accent`, `.drop-cap`, and `.input` classes**

Find the existing `.drop-cap` rule (it already exists). Replace it with the version below, and add the new `.accent` and `.input` rules nearby in a clearly labelled `/* ===== Utility classes ===== */` section.

```css
/* ===== Utility classes ===== */

/* Italic claret accent — used inside Cormorant headings and label props.
   Use this span (not <em>) to bypass conflicts with global em styling. */
.accent {
  color: var(--color-claret);
  font-style: italic;
  font-weight: 400;
}

/* Drop cap — applied as a class on a paragraph */
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

/* Form input — used in Contact, Newsletter, EmptyState */
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

If the previous `.drop-cap` rule was elsewhere in the file, delete the old copy so there's only one.

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: build succeeds. Visit the homepage in `npm run dev` and confirm the drop cap still renders on the intro paragraph.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Add .accent, .drop-cap, .input utility classes"
```

---

### Task 4: Add brand constants module

**Files:**
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Write the constants file**

Create `src/lib/constants.ts`:

```ts
/**
 * Brand-level constants.
 *
 * All recordings shown on the site originate from a single YouTube channel.
 * Hardcoding any of these URLs in a component is a bug — import from here.
 */

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@almaconsort';
export const YOUTUBE_CHANNEL_HANDLE = '@almaconsort';

export const YOUTUBE_THUMB = (id: string): string =>
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export const YOUTUBE_WATCH = (id: string): string =>
  `https://www.youtube.com/watch?v=${id}`;

export const YOUTUBE_EMBED = (id: string): string =>
  `https://www.youtube.com/embed/${id}`;
```

- [ ] **Step 2: Build & verify TypeScript compiles**

Run: `npx astro check`
Expected: no errors. (If `astro check` is not installed, run `npm run build` which will surface TypeScript issues.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "Add src/lib/constants.ts with YouTube channel constants"
```

---

## Phase 2 — Buttons

### Task 5: Add button styles to `global.css`

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace the existing `.btn`, `.btn-primary` block with the new button styles**

Find the existing `/* ===== Buttons ===== */` section. Replace it with:

```css
/* ===== Buttons ===== */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
  padding: 12px 22px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  line-height: 1;
  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.btn-primary {
  background: var(--color-claret);
  color: var(--color-bg);
  border: 1px solid var(--color-claret);
}
.btn-primary:hover,
.btn-primary:focus { background: var(--color-claret-hover); border-color: var(--color-claret-hover); color: var(--color-bg); }
.btn-primary:focus-visible { outline: 2px solid var(--color-claret); outline-offset: 3px; }

.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid rgba(42, 38, 32, 0.55);
}
.btn-secondary:hover,
.btn-secondary:focus { background: rgba(42, 38, 32, 0.06); border-color: var(--color-text); color: var(--color-text); }
.btn-secondary:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }

.btn-arrow { font-family: var(--font-serif); font-size: 1.05rem; line-height: 1; transition: transform var(--transition); }
.btn-primary:hover .btn-arrow,
.btn-secondary:hover .btn-arrow { transform: translateX(3px); }
```

Leave the legacy `.btn` class in place if anything still references it — confirm later with `grep -rn '"btn"' src/`. If nothing references it, delete the legacy `.btn` block in the same edit.

- [ ] **Step 2: Build & verify**

Run: `npm run build && grep -rn '\bbtn\b' src/ | grep -v 'btn-primary\|btn-secondary\|btn-arrow'`
Expected: build succeeds. The grep returns no hits — confirms the legacy `.btn` class can be removed if it still exists.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Replace ad-hoc button styles with .btn-primary and .btn-secondary"
```

---

### Task 6: Create `Button.astro` component

**Files:**
- Create: `src/components/Button.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  variant?: 'primary' | 'secondary';
  href?: string;
  type?: 'button' | 'submit';
  arrow?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  class?: string;
}

const {
  variant = 'primary',
  href,
  type = 'button',
  arrow = false,
  target,
  rel,
  ariaLabel,
  class: extraClass = '',
} = Astro.props;

const className = `btn-${variant} ${extraClass}`.trim();
---
{
  href ? (
    <a href={href} class={className} target={target} rel={rel} aria-label={ariaLabel}>
      <slot />
      {arrow && <span class="btn-arrow" aria-hidden="true">→</span>}
    </a>
  ) : (
    <button type={type} class={className} aria-label={ariaLabel}>
      <slot />
      {arrow && <span class="btn-arrow" aria-hidden="true">→</span>}
    </button>
  )
}
```

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Button.astro
git commit -m "Add Button.astro with primary/secondary variants and optional arrow"
```

---

### Task 7: Update `StripeButton.astro` to use `.btn-primary`

**Files:**
- Modify: `src/components/StripeButton.astro`

- [ ] **Step 1: Read current file**

Run: `cat src/components/StripeButton.astro`

Identify the existing class (likely `.btn`) and any bespoke styles in a `<style>` block.

- [ ] **Step 2: Replace the class with `btn-primary`**

In the component's HTML output, change the button's class from whatever it currently is (`btn`, `stripe-btn`, etc.) to `btn-primary`. Remove any bespoke styling in the component's `<style>` block that the global `.btn-primary` now handles. Keep any Stripe-specific data attributes and behaviour intact.

- [ ] **Step 3: Build & visually verify on /support pages**

Run: `npm run build && npm run dev`
Visit `/support/` and any tier subpage. Confirm the Stripe buttons render in solid claret with cream text.

- [ ] **Step 4: Commit**

```bash
git add src/components/StripeButton.astro
git commit -m "Render StripeButton via .btn-primary"
```

---

### Task 8: Restyle `Newsletter.astro` inputs and submit

**Files:**
- Modify: `src/components/Newsletter.astro`

- [ ] **Step 1: Read current file**

Run: `cat src/components/Newsletter.astro`

- [ ] **Step 2: Apply new classes**

In the markup:
- Add `class="input"` to the email `<input>` (combine with any existing classes).
- Change the submit button's class to `btn-primary`. If it's currently a styled `<button>` with bespoke CSS in the component's `<style>` block, remove that bespoke CSS.

If the layout was using flex/grid for the input + button arrangement, keep that arrangement — the spec says the input and the button sit side-by-side (no rounded button-end), so prefer a layout like:

```html
<form class="newsletter-form" …>
  <input type="email" class="input" name="EMAIL" placeholder="you@example.com" required />
  <button type="submit" class="btn-primary">Subscribe</button>
</form>
```

```css
.newsletter-form { display: flex; gap: 0; }
.newsletter-form .input { border-radius: var(--radius-sm) 0 0 var(--radius-sm); border-right: none; min-width: 240px; }
.newsletter-form .btn-primary { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
@media (max-width: 768px) {
  .newsletter-form { flex-direction: column; gap: 8px; }
  .newsletter-form .input, .newsletter-form .btn-primary { border-radius: var(--radius-sm); border-right: 1px solid; }
}
```

(Adjust property names to match the actual element structure in the file.)

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Open any page (the newsletter sits above the footer site-wide). Confirm the input is parchment-toned with claret focus border; the button is solid claret cream-on-claret. Submit a fake email to verify no behavioural regression.

- [ ] **Step 4: Commit**

```bash
git add src/components/Newsletter.astro
git commit -m "Restyle Newsletter input and button to use new tokens"
```

---

### Task 9: Restyle `ContactForm.astro` inputs and submit

**Files:**
- Modify: `src/components/ContactForm.astro`

- [ ] **Step 1: Apply new classes**

In every `<input>`, `<textarea>`, and `<select>` add `class="input"`. Change the submit button's class to `btn-primary`. Remove any bespoke input/button styling from the component's local `<style>` block — the global classes handle it.

- [ ] **Step 2: Build & verify**

Run: `npm run build && npm run dev`
Visit `/contact/`. Confirm:
- Inputs render in the parchment style
- Focus ring is claret
- Submit button is solid claret cream-on-claret

- [ ] **Step 3: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "Restyle ContactForm inputs and submit to use new tokens"
```

---

## Phase 3 — Editorial primitives

### Task 10: Create `TitleBlock.astro`

**Files:**
- Create: `src/components/TitleBlock.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  title: string;
  pitch?: string;  // may contain <span class="accent">…</span>
}
const { title, pitch } = Astro.props;
---
<section class="title-block">
  <h1>{title}</h1>
  {pitch && <p class="pitch" set:html={pitch} />}
</section>

<style>
  .title-block {
    padding: 54px 0 30px;
    border-bottom: 1px solid var(--color-border-strong);
    margin: 0 0 var(--space-8);
  }
  .title-block h1 {
    font-family: var(--font-serif);
    font-size: 3.4rem;
    line-height: 1;
    font-variant: small-caps;
    letter-spacing: -0.005em;
    font-weight: 500;
    margin: 0 0 18px;
    color: var(--color-heading);
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
</style>
```

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/TitleBlock.astro
git commit -m "Add TitleBlock.astro (chapter-opening page heading)"
```

---

### Task 11: Create `OrnamentRule.astro`

**Files:**
- Create: `src/components/OrnamentRule.astro`

- [ ] **Step 1: Write the component**

```astro
---
---
<div class="ornament-rule" aria-hidden="true">· · · · ·</div>

<style>
  .ornament-rule {
    text-align: center;
    color: var(--color-accent);
    font-size: 1.1rem;
    letter-spacing: 0.5em;
    padding: 36px 0 30px;
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/OrnamentRule.astro && \
  git commit -m "Add OrnamentRule.astro to replace Divider"
```

---

### Task 12: Create `SectionHead.astro`

**Files:**
- Create: `src/components/SectionHead.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  title: string;
  link?: { href: string; label: string; target?: string; rel?: string };
}
const { title, link } = Astro.props;
---
<header class="section-head">
  <h2 set:html={title} />
  {link && (
    <a href={link.href} target={link.target} rel={link.rel}>{link.label}</a>
  )}
</header>

<style>
  .section-head {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    border-bottom: 1px solid var(--color-border-strong);
    padding-bottom: 10px;
    margin-bottom: 22px;
    gap: 16px;
  }
  .section-head h2 {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    font-weight: 500;
    margin: 0;
    color: var(--color-heading);
  }
  .section-head a {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent);
    text-decoration: none;
    white-space: nowrap;
  }
  .section-head a:hover { color: var(--color-claret); }
  .section-head a:focus-visible {
    outline: 2px solid var(--color-claret);
    outline-offset: 3px;
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/SectionHead.astro && \
  git commit -m "Add SectionHead.astro (h2 + optional right-aligned link)"
```

---

### Task 13: Create `EmptyState.astro`

**Files:**
- Create: `src/components/EmptyState.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  title: string;          // may contain <span class="accent">…</span>
  body?: string;
  newsletter?: boolean;   // default true
}
const { title, body, newsletter = true } = Astro.props;
---
<div class={`empty-state${newsletter ? ' with-form' : ''}`}>
  <div class="empty-text">
    <h3 set:html={title} />
    {body && <p>{body}</p>}
  </div>
  {newsletter && (
    <form class="empty-form" action="https://buttondown.email/api/emails/embed-subscribe/almaconsort" method="post" target="_blank">
      <input type="email" class="input" name="email" placeholder="you@example.com" required />
      <button type="submit" class="btn-primary">Subscribe</button>
    </form>
  )}
</div>

<style>
  .empty-state {
    border: 1px solid var(--color-border-strong);
    background:
      repeating-linear-gradient(135deg, transparent 0 8px, rgba(60,40,20,0.025) 8px 9px),
      rgba(247, 243, 232, 0.4);
    padding: 36px 28px;
  }
  .empty-state.with-form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 28px;
    align-items: center;
  }
  .empty-text h3 {
    font-family: var(--font-serif);
    font-size: 1.3rem;
    line-height: 1.25;
    font-weight: 500;
    margin: 0 0 6px;
    color: var(--color-heading);
  }
  .empty-text p {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
    max-width: 48ch;
  }
  .empty-form { display: flex; gap: 0; align-items: stretch; }
  .empty-form .input {
    min-width: 240px;
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    border-right: none;
  }
  .empty-form .btn-primary {
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }
  @media (max-width: 768px) {
    .empty-state.with-form { grid-template-columns: 1fr; }
    .empty-form { flex-direction: column; gap: 8px; }
    .empty-form .input,
    .empty-form .btn-primary { border-radius: var(--radius-sm); border-right: 1px solid; }
  }
</style>
```

If a different newsletter provider URL is in use, replace the form `action` URL — copy it from `Newsletter.astro` so both components hit the same endpoint.

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/EmptyState.astro && \
  git commit -m "Add EmptyState.astro with optional newsletter form"
```

---

### Task 14: Create `ScholarsCallout.astro`

**Files:**
- Create: `src/components/ScholarsCallout.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  variant?: 'compact' | 'full';
}
const { variant = 'full' } = Astro.props;
const baseUrl = import.meta.env.BASE_URL;
---
<aside class={`scholars-callout ${variant}`}>
  <div class="text">
    <div class="eyebrow">Mentoring · Performance · Recording</div>
    <h3>
      We mentor early-career singers through the <span class="accent">Alma Scholars</span> programme.
    </h3>
    {variant === 'full' && (
      <p>Nurturing the next generation of young choral singers through mentoring, performance opportunities, and professional recordings.</p>
    )}
  </div>
  <div class="actions">
    <a href={`${baseUrl}scholars/`} class="btn-primary">About the programme</a>
    <a href={`${baseUrl}support/`} class="btn-secondary">How to support</a>
  </div>
</aside>

<style>
  .scholars-callout {
    border: 1px solid var(--color-claret-border);
    background: linear-gradient(180deg, var(--color-claret-soft), transparent);
    padding: 26px 24px;
    display: grid;
    grid-template-columns: 1.3fr auto;
    gap: 36px;
    align-items: center;
  }
  .eyebrow {
    font-family: var(--font-sans);
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-claret);
    margin-bottom: 8px;
  }
  .scholars-callout h3 {
    font-family: var(--font-serif);
    font-size: 1.55rem;
    line-height: 1.15;
    font-weight: 500;
    margin: 0 0 10px;
    color: var(--color-heading);
  }
  .scholars-callout.compact h3 { font-size: 1.35rem; }
  .scholars-callout p {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
  }
  .actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-self: end;
  }
  @media (max-width: 768px) {
    .scholars-callout { grid-template-columns: 1fr; gap: 16px; }
    .actions { justify-self: start; flex-direction: column; align-items: stretch; }
    .actions .btn-primary,
    .actions .btn-secondary { justify-content: center; }
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/ScholarsCallout.astro && \
  git commit -m "Add ScholarsCallout.astro (compact + full variants)"
```

---

### Task 15: Create `EnquiryBand.astro`

**Files:**
- Create: `src/components/EnquiryBand.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  title: string;          // may include <span class="accent">…</span>
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}
const { title, body, primaryHref, primaryLabel, secondaryHref, secondaryLabel } = Astro.props;
---
<section class="enquiry-band">
  <div class="text">
    <h2 set:html={title} />
    <p>{body}</p>
  </div>
  <div class="actions">
    <a href={primaryHref} class="btn-primary">{primaryLabel}</a>
    {secondaryHref && secondaryLabel && (
      <a href={secondaryHref} class="btn-secondary">{secondaryLabel}</a>
    )}
  </div>
</section>

<style>
  .enquiry-band {
    padding: 48px 0;
    border-top: 1px solid var(--color-border-strong);
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 56px;
    align-items: center;
  }
  .enquiry-band h2 {
    font-family: var(--font-serif);
    font-size: 2.4rem;
    line-height: 1;
    letter-spacing: -0.01em;
    font-weight: 500;
    margin: 0 0 14px;
    color: var(--color-heading);
  }
  .enquiry-band p {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.1rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
  }
  .actions {
    display: flex;
    gap: 14px;
    justify-self: end;
    align-items: center;
  }
  @media (max-width: 768px) {
    .enquiry-band { grid-template-columns: 1fr; gap: 24px; padding: 32px 0; }
    .enquiry-band h2 { font-size: 2rem; }
    .actions { justify-self: start; flex-direction: column; align-items: stretch; }
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/EnquiryBand.astro && \
  git commit -m "Add EnquiryBand.astro for recording page CTA footer"
```

---

## Phase 4 — Header refresh

### Task 16: Refactor `Header.astro`

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Read the existing file**

Run: `cat src/components/Header.astro` to confirm the existing nav-link list and hamburger script.

- [ ] **Step 2: Update the `<style>` block**

Replace the `.brand-name` and `.main-nav a` rules with:

```css
.brand-name {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-variant: small-caps;
  letter-spacing: 0.1em;
  font-weight: 500;
  line-height: 1;
  color: var(--color-heading);
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 1.85rem;
}

.main-nav a {
  position: relative;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text);
  transition: color var(--transition);
  white-space: nowrap;
  padding-bottom: 0.4rem;
}

.main-nav a:hover { color: var(--color-claret); }

.main-nav a.active { color: var(--color-claret); }
.main-nav a.active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 1px;
  background: var(--color-claret);
}

.main-nav a:focus-visible {
  outline: 2px solid var(--color-claret);
  outline-offset: 3px;
  border-radius: 2px;
}
```

Delete the existing scaleX-animated underline rule (`.main-nav a::after { … transform: scaleX(0); … transition }`) — the new design uses a static underline only on the active state.

Update `.site-header` border to use the strong token:

```css
.site-header {
  border-bottom: 1px solid var(--color-border-strong);
  padding: 1rem 0;
  position: relative;
  background-color: var(--color-bg);
}
```

Keep all hamburger / mobile-nav / `:global(.hamburger-mode)` rules and the `<script>` block at the end of the file unchanged.

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Open the site:
- Nav text reads as Inter uppercase
- Hovering a link turns it claret
- The active link is claret with a 1px claret underline (no animation)
- Wordmark unchanged

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "Refresh Header — Inter nav, claret active state, static underline"
```

---

## Phase 5 — Tile system

### Task 17: Create `ConcertTile.astro` — no-photo state

**Files:**
- Create: `src/components/ConcertTile.astro`

- [ ] **Step 1: Write the component with no-photo state only first**

```astro
---
import { getImage } from 'astro:assets';

interface Props {
  slug: string;
  title: string;            // may include <span class="accent">…</span>
  date: Date;
  venue: { name: string; address?: string };
  startTime?: string;
  priceFrom?: string;
  composers?: string[];
  altTitle?: string;
  photo?: ImageMetadata;
  photoAlt?: string;
  photoCaption?: string;
}

const {
  slug,
  title,
  date,
  venue,
  startTime,
  priceFrom,
  composers,
  altTitle,
  photo,
  photoAlt,
  photoCaption,
} = Astro.props;

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthsLong = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const day = date.getDate();
const monthLong = monthsLong[date.getMonth()];
const year = date.getFullYear();

const baseUrl = import.meta.env.BASE_URL;
const href = `${baseUrl}events/${slug}/`;

const captionText = photoCaption ?? venue.name;

const photoUrl = photo
  ? (await getImage({ src: photo, widths: [400, 600, 900], formats: ['webp'] })).src
  : undefined;
---
<a class="concert-tile" href={href} aria-label={`${date.toDateString()} — ${venue.name}`}>
  {photoUrl ? (
    <div class="plate photo" style={`background-image: url(${photoUrl})`}>
      <div class="photo-date">
        <div class="day">{day}</div>
        <div class="mo">{monthLong}</div>
      </div>
      <div class="photo-year">{year}</div>
      <div class="photo-cap">{captionText}</div>
    </div>
  ) : (
    <div class="plate np">
      <div class="corner-date">
        <div class="day">{day}</div>
        <div class="mo">{monthLong}</div>
      </div>
      <div class="corner-year">{year}</div>
      <div class="centre-block">
        <div class="centre-rule" />
        {composers && composers.length > 0 ? (
          <div class="composer-stack">
            {composers.map((name) => <span class="name">{name}</span>)}
          </div>
        ) : altTitle ? (
          <div class="composer-stack">
            <span class="name alt-title">{altTitle}</span>
          </div>
        ) : null}
        <div class="centre-rule" />
      </div>
    </div>
  )}
  <h3 class="tile-title" set:html={title} />
  <div class="tile-meta">
    {venue.name}{startTime ? ` · ${startTime}` : ''}{priceFrom ? ` · ${priceFrom}` : ''}
  </div>
</a>

<style>
  .concert-tile {
    display: grid;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }
  .concert-tile:focus-visible {
    outline: 2px solid var(--color-claret);
    outline-offset: 3px;
  }

  .plate {
    aspect-ratio: 5 / 4;
    position: relative;
    overflow: hidden;
    border-radius: 1px;
    border: 1px solid var(--color-border-strong);
    transition: box-shadow var(--transition);
  }
  .concert-tile:hover .plate { box-shadow: var(--shadow-tile-hover); }

  /* No-photo state */
  .plate.np {
    background: var(--color-bg-tint);
    display: grid;
    align-items: center;
    justify-items: center;
    padding: 38px 22px;
  }
  .corner-date {
    position: absolute; top: 14px; left: 16px;
    font-family: var(--font-serif);
    font-variant: small-caps;
    letter-spacing: 0.06em;
  }
  .corner-date .day { font-size: 2.1rem; line-height: 1; color: var(--color-text); font-weight: 500; }
  .corner-date .mo {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-top: 4px;
  }
  .corner-year {
    position: absolute; top: 14px; right: 14px;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: var(--color-claret);
    border: 1px solid var(--color-claret-border);
    padding: 3px 9px;
    background: rgba(247, 243, 232, 0.6);
  }
  .centre-block {
    display: grid;
    gap: 12px;
    justify-items: center;
    max-width: 80%;
    text-align: center;
  }
  .centre-rule { width: 36px; height: 1px; background: var(--color-claret-border); }
  .composer-stack {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    line-height: 1.45;
    color: var(--color-text);
  }
  .composer-stack .name { display: block; }
  .composer-stack .name.alt-title {
    font-style: italic;
    font-size: 1.05rem;
    color: var(--color-text-muted);
  }

  /* Photo state */
  .plate.photo {
    background-size: cover;
    background-position: center;
  }
  .plate.photo::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }
  .photo-date {
    position: absolute; top: 12px; left: 14px; z-index: 1;
    font-family: var(--font-serif);
    font-variant: small-caps;
    letter-spacing: 0.06em;
  }
  .photo-date .day {
    font-size: 1.9rem; line-height: 1;
    color: var(--color-text-light);
    text-shadow: var(--shadow-text-on-photo);
  }
  .photo-date .mo {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-light);
    text-shadow: var(--shadow-text-on-photo);
  }
  .photo-year {
    position: absolute; top: 14px; right: 14px; z-index: 1;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: var(--color-text-light);
    border: 1px solid rgba(251,243,223,0.55);
    padding: 3px 9px;
    background: rgba(0,0,0,0.25);
  }
  .photo-cap {
    position: absolute; left: 14px; right: 14px; bottom: 12px; z-index: 1;
    color: var(--color-text-light);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.9rem;
    text-shadow: var(--shadow-text-on-photo);
  }

  .tile-title {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    line-height: 1.2;
    font-weight: 500;
    margin: 4px 0 4px;
    color: var(--color-heading);
    transition: color var(--transition);
  }
  .concert-tile:hover .tile-title { color: var(--color-claret); }

  .tile-meta {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }
</style>
```

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: build succeeds. (Visual verification happens when we use the component on the homepage in Task 28.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ConcertTile.astro
git commit -m "Add ConcertTile.astro with photo + no-photo states"
```

---

### Task 18: Create `RecordingTile.astro`

**Files:**
- Create: `src/components/RecordingTile.astro`

- [ ] **Step 1: Write the component**

```astro
---
import { YOUTUBE_THUMB, YOUTUBE_WATCH } from '../lib/constants';

interface Props {
  youtubeId: string;
  title: string;          // may include <span class="accent">…</span>
  composer: string;
  href?: string;          // defaults to YouTube watch URL
}

const { youtubeId, title, composer, href } = Astro.props;
const targetHref = href ?? YOUTUBE_WATCH(youtubeId);
const thumbUrl = YOUTUBE_THUMB(youtubeId);
const isExternal = targetHref.startsWith('http');
---
<a
  class="recording-tile"
  href={targetHref}
  target={isExternal ? '_blank' : undefined}
  rel={isExternal ? 'noopener' : undefined}
  aria-label={`Play recording: ${composer}`}
>
  <div class="plate" style={`background-image: url(${thumbUrl})`}>
    <div class="play-btn" aria-hidden="true"><span>▶</span></div>
  </div>
  <h3 class="tile-title" set:html={title} />
  <div class="tile-meta">{composer}</div>
</a>

<style>
  .recording-tile {
    display: grid;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }
  .recording-tile:focus-visible {
    outline: 2px solid var(--color-claret);
    outline-offset: 3px;
  }
  .plate {
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
    border-radius: 1px;
    border: 1px solid var(--color-border-strong);
    background-size: cover;
    background-position: center;
    background-color: var(--color-bg-tint);
    transition: box-shadow var(--transition);
  }
  .recording-tile:hover .plate { box-shadow: var(--shadow-tile-hover); }
  .play-btn {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .play-btn span {
    display: flex; align-items: center; justify-content: center;
    width: 54px; height: 54px;
    border-radius: 50%;
    background: rgba(247, 243, 232, 0.92);
    color: var(--color-claret);
    font-size: 1.1rem;
    padding-left: 4px;
    box-shadow: var(--shadow-play-btn);
    transition: transform var(--transition), background var(--transition);
  }
  .recording-tile:hover .play-btn span {
    transform: scale(1.08);
    background: var(--color-text-light);
  }

  .tile-title {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    line-height: 1.2;
    font-weight: 500;
    margin: 4px 0 4px;
    color: var(--color-heading);
    transition: color var(--transition);
  }
  .recording-tile:hover .tile-title { color: var(--color-claret); }
  .tile-meta {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/RecordingTile.astro && \
  git commit -m "Add RecordingTile.astro (stripped — thumbnail + play button)"
```

---

### Task 19: Create `BioPlate.astro`

**Files:**
- Create: `src/components/BioPlate.astro`

- [ ] **Step 1: Write the component**

```astro
---
import { getImage } from 'astro:assets';

interface Props {
  name: string;
  role: string;                 // top-left overlay/corner label, e.g. "Director"
  roleTags?: string[];          // Inter eyebrow above bio heading
  photo?: ImageMetadata;
  photoAlt?: string;
  monogram?: string;            // auto-derived if absent
  monogramSubtitle?: string;    // italic line beneath monogram in no-photo state
}

const { name, role, roleTags, photo, monogram, monogramSubtitle } = Astro.props;

function deriveMonogram(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const mono = monogram ?? deriveMonogram(name);
const year = new Date().getFullYear();

const photoUrl = photo
  ? (await getImage({ src: photo, widths: [400, 600, 800], formats: ['webp'] })).src
  : undefined;
---
<article class="bio">
  {photoUrl ? (
    <div class="bio-plate photo" style={`background-image: url(${photoUrl})`}>
      <div class="bio-photo-role">{role}</div>
      <div class="bio-photo-name">{name}</div>
    </div>
  ) : (
    <div class="bio-plate np">
      <div class="corner-role">{role}</div>
      <div class="corner-year">{year}</div>
      <div class="bio-centre">
        <div class="monogram" aria-hidden="true">{mono}</div>
        <div class="monogram-name">{name}</div>
        <div class="monogram-rule" />
        {monogramSubtitle && <div class="monogram-foot">{monogramSubtitle}</div>}
      </div>
    </div>
  )}
  <div class="bio-body">
    {roleTags && (
      <div class="bio-eyebrow">{roleTags.join(' · ')}</div>
    )}
    <h3>{name}</h3>
    <slot />
  </div>
</article>

<style>
  .bio { display: grid; gap: 16px; }
  .bio-plate {
    aspect-ratio: 4 / 5;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border-strong);
    border-radius: 1px;
  }

  /* Photo state */
  .bio-plate.photo {
    background-size: cover;
    background-position: center 25%;
  }
  .bio-plate.photo::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }
  .bio-photo-role {
    position: absolute; left: 18px; top: 16px; z-index: 1;
    color: var(--color-text-light);
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-shadow: var(--shadow-text-on-photo);
  }
  .bio-photo-name {
    position: absolute; left: 18px; right: 18px; bottom: 14px; z-index: 1;
    color: var(--color-text-light);
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    text-shadow: var(--shadow-text-on-photo);
  }

  /* No-photo state */
  .bio-plate.np {
    background: var(--color-bg-tint);
    display: grid;
    align-items: center;
    justify-items: center;
    padding: 32px 20px;
  }
  .corner-role {
    position: absolute; top: 14px; left: 16px;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent);
  }
  .corner-year {
    position: absolute; top: 14px; right: 14px;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: var(--color-claret);
    border: 1px solid var(--color-claret-border);
    padding: 3px 9px;
    background: rgba(247, 243, 232, 0.6);
  }
  .bio-centre { text-align: center; }
  .monogram {
    font-family: var(--font-serif);
    color: var(--color-claret);
    font-size: 5rem; line-height: 1;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    font-weight: 500;
  }
  .monogram-name {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-variant: small-caps;
    letter-spacing: 0.1em;
    color: var(--color-text);
    margin-top: 12px;
  }
  .monogram-rule {
    width: 36px; height: 1px;
    background: var(--color-claret-border);
    margin: 12px auto;
  }
  .monogram-foot {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.92rem;
    color: var(--color-text-muted);
    max-width: 26ch;
    margin: 0 auto;
  }

  /* Bio body */
  .bio-body {
    display: grid;
    gap: 8px;
  }
  .bio-eyebrow {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-claret);
  }
  .bio-body h3 {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    line-height: 1.1;
    font-weight: 500;
    margin: 2px 0 8px;
    color: var(--color-heading);
  }
  .bio-body :global(p) {
    font-family: var(--font-serif);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-text);
    margin: 0 0 10px;
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/BioPlate.astro && \
  git commit -m "Add BioPlate.astro with photo + monogram states"
```

---

## Phase 6 — Schema + featured recordings collection

### Task 20: Extend events schema and add `featuredRecordings` collection

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Update the events schema and add the new collection**

Replace the entire contents of `src/content.config.ts` with:

```ts
import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    venue: z.object({
      name: z.string(),
      address: z.string().optional(),
    }),
    description: z.string(),
    ticketUrl: z.string().url().optional(),
    image: z.string().optional(),          // legacy — kept for compatibility
    performers: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    programme: z.array(z.object({
      composer: z.string(),
      work: z.string(),
    })).optional(),

    // Editorial uplift additions
    photo: image().optional(),
    photoAlt: z.string().optional(),
    photoCaption: z.string().optional(),
    composers: z.array(z.string()).optional(),
    altTitle: z.string().optional(),
    priceFrom: z.string().optional(),
  }).refine(
    (data) => !data.photo || (data.photo && data.photoAlt),
    { message: 'photoAlt is required when photo is set', path: ['photoAlt'] }
  ),
});

const supportTiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/support-tiers' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    tagline: z.string(),
    cardImage: z.string().optional(),
    stripeButtons: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        tierName: z.string(),
        price: z.string(),
        billingNote: z.string().optional(),
      })
    ),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const featuredRecordings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/featuredRecordings' }),
  schema: z.object({
    youtubeId: z.string(),
    title: z.string(),
    composer: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { events, supportTiers, blog, featuredRecordings };
```

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: build succeeds. Schema additions are all optional; existing events continue to validate.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "Extend events schema and add featuredRecordings collection"
```

---

### Task 21: Add three seed Featured Recordings

**Files:**
- Create: `src/content/featuredRecordings/01-o-magnum-mysterium.md`
- Create: `src/content/featuredRecordings/02-second-recording.md`
- Create: `src/content/featuredRecordings/03-third-recording.md`

- [ ] **Step 1: Create the three seed entries**

`src/content/featuredRecordings/01-o-magnum-mysterium.md`:
```markdown
---
youtubeId: 'GjNdZVs7g68'
title: 'O Magnum <span class="accent">Mysterium</span>'
composer: 'Tomás Luis de Victoria'
order: 1
---
```

`src/content/featuredRecordings/02-second-recording.md`:
```markdown
---
youtubeId: 'REPLACE_WITH_REAL_ID'
title: 'Second <span class="accent">Recording</span>'
composer: 'Composer Name'
order: 2
---
```

`src/content/featuredRecordings/03-third-recording.md`:
```markdown
---
youtubeId: 'REPLACE_WITH_REAL_ID'
title: 'Third <span class="accent">Recording</span>'
composer: 'Composer Name'
order: 3
---
```

The two `REPLACE_WITH_REAL_ID` placeholders should be filled with real video IDs from `https://www.youtube.com/@almaconsort`. Pick the two most representative recordings the user has uploaded. If unsure, list the channel's videos before continuing — do not commit placeholder IDs.

- [ ] **Step 2: Verify by visiting the YouTube channel and confirming each `youtubeId` resolves**

For each entry, open `https://www.youtube.com/watch?v={youtubeId}` in a browser and confirm the video plays. Confirm `https://i.ytimg.com/vi/{youtubeId}/maxresdefault.jpg` returns an image.

- [ ] **Step 3: Build & verify**

Run: `npm run build`
Expected: build succeeds; all three entries validate against the schema.

- [ ] **Step 4: Commit**

```bash
git add src/content/featuredRecordings/
git commit -m "Add three seed Featured Recordings entries"
```

---

## Phase 7 — Homepage

### Task 22: Rebuild `index.astro` using new components

**Files:**
- Modify: `src/pages/index.astro` (full rewrite of the body markup)

- [ ] **Step 1: Replace the page body**

Replace the `<BaseLayout>` body in `src/pages/index.astro` with the structure below. Keep all existing imports/setup (BaseLayout, lite-youtube setup, schema.org JSON-LD) intact; only the body composition changes.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import OrnamentRule from '../components/OrnamentRule.astro';
import SectionHead from '../components/SectionHead.astro';
import ConcertTile from '../components/ConcertTile.astro';
import EmptyState from '../components/EmptyState.astro';
import FeaturedRecordings from '../components/FeaturedRecordings.astro';
import ScholarsCallout from '../components/ScholarsCallout.astro';
import { getCollection } from 'astro:content';

const base = import.meta.env.BASE_URL;

const now = new Date();
const allEvents = await getCollection('events');
const upcoming = allEvents
  .filter((e) => e.data.date >= now)
  .sort((a, b) => a.data.date.getTime() - b.data.date.getTime())
  .slice(0, 3);

const allPosts = (await getCollection('blog'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);

const heroVideoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "O Magnum Mysterium — Tomás Luis de Victoria",
  "description": "Alma Consort, directed by Luca Wetherall, performing Victoria's O Magnum Mysterium.",
  "thumbnailUrl": "https://i.ytimg.com/vi/GjNdZVs7g68/maxresdefault.jpg",
  "embedUrl": "https://www.youtube.com/embed/GjNdZVs7g68",
  "contentUrl": "https://www.youtube.com/watch?v=GjNdZVs7g68",
  "uploadDate": "2025-12-01",
  "publisher": { "@id": new URL(base, Astro.site).href + '#org' }
};
---
<BaseLayout title="Alma Consort | Professional Chamber Choir in London" description="Alma Consort is a London-based professional chamber choir performing Renaissance polyphony, contemporary commissions, jazz, and popular repertoire, on the concert platform and in the recording studio.">
  <link slot="head" rel="preconnect" href="https://i.ytimg.com" />
  <link slot="head" rel="preconnect" href="https://www.youtube.com" />
  <link slot="head" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.css" />
  <script slot="head" is:inline src="https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.js"></script>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(heroVideoJsonLd)} />
  <h1 class="visually-hidden">Alma Consort — Professional Chamber Choir, London</h1>

  <!-- Video hero -->
  <div class="site-container">
    <div class="video-wrapper">
      <lite-youtube videoid="GjNdZVs7g68" playlabel="Play: O Magnum Mysterium - Victoria (Alma Consort / Luca Wetherall)">
        <a href="https://youtube.com/watch?v=GjNdZVs7g68" class="lty-playbtn" title="Play Video">
          <span class="lyt-visually-hidden">Play Video: O Magnum Mysterium - Victoria (Alma Consort / Luca Wetherall)</span>
        </a>
      </lite-youtube>
      <div class="video-caption">
        <span class="caption-text"><strong>O Magnum Mysterium</strong> — Tomás Luis de Victoria (1572)</span>
        <a href={`${base}recording/`} class="caption-link">All recordings →</a>
      </div>
    </div>
  </div>

  <!-- Intro -->
  <div class="container">
    <div class="home-text">
      <p class="drop-cap">
        The <strong>Alma Consort</strong> is a professional chamber choir in London. Our singers come from the city's leading ensembles and cathedral choirs. We sing Renaissance polyphony, contemporary commissions, jazz arrangements, and popular repertoire, on the concert platform and in the recording studio.
      </p>
      <p>
        <a href={`${base}recording/`}>Recording</a> sits at the centre of what we do. We run studio sessions for composers, producers, and labels, and we produce our own releases. Our in-house team captures the audio and video.
      </p>
      <p>
        <a href={`${base}about/`}>Luca Wetherall</a> and <a href={`${base}about/`}>Izzy Mohan</a> direct the ensemble. Browse our upcoming <a href={`${base}events/`}>events</a>, or <a href={`${base}contact/`}>write to us</a> about a project.
      </p>
    </div>

    <OrnamentRule />

    <!-- Upcoming Concerts -->
    <section class="home-section">
      <SectionHead title="Upcoming Concerts" link={{ href: `${base}events/`, label: 'View all events →' }} />
      {upcoming.length > 0 ? (
        <div class="tile-row">
          {upcoming.map((event) => (
            <ConcertTile
              slug={event.id}
              title={event.data.title}
              date={event.data.date}
              venue={event.data.venue}
              startTime={event.data.startTime}
              priceFrom={event.data.priceFrom}
              composers={event.data.composers}
              altTitle={event.data.altTitle}
              photo={event.data.photo}
              photoAlt={event.data.photoAlt}
              photoCaption={event.data.photoCaption}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`Our next concert hasn't been announced <span class="accent">yet</span>.`}
          body="Subscribe to be the first to hear when dates are confirmed."
        />
      )}
    </section>

    <!-- Featured Recordings -->
    <FeaturedRecordings />

    <!-- Latest News + Scholars -->
    <div class="home-duo">
      <div class="home-column">
        <SectionHead title="Latest News" link={{ href: `${base}blog/`, label: 'Read all news →' }} />
        {allPosts.length > 0 ? (
          <ul class="news-list">
            {allPosts.map((post) => {
              const dateStr = post.data.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              return (
                <li>
                  <a href={`${base}blog/${post.id}/`}>
                    <span class="news-date">{dateStr}</span>
                    <span class="news-title" set:html={post.data.title} />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p class="news-empty">New writing on its way.</p>
        )}
      </div>

      <ScholarsCallout variant="compact" />
    </div>
  </div>
</BaseLayout>

<style>
  .video-wrapper { margin-bottom: 2.5rem; }
  lite-youtube { max-width: 100%; aspect-ratio: 16 / 9; }
  .video-caption {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    gap: 16px;
    padding: 14px 2px 0;
  }
  .caption-text {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.05rem;
    color: var(--color-text-muted);
  }
  .caption-text strong { font-style: normal; font-weight: 500; color: var(--color-text); }
  .caption-link {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-claret);
    text-decoration: none;
    border-bottom: 1px solid var(--color-claret);
    padding-bottom: 2px;
  }

  .home-text { font-size: 1.1rem; line-height: 1.8; }

  .home-section { margin-bottom: 56px; }
  .tile-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .home-duo {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 56px;
    align-items: start;
    margin-top: 8px;
    padding-bottom: 32px;
  }

  .news-list { list-style: none; padding: 0; margin: 0; }
  .news-list li { padding: 14px 0; border-bottom: 1px solid var(--color-border); }
  .news-list li:last-child { border-bottom: none; }
  .news-list a {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 16px;
    align-items: baseline;
    text-decoration: none;
    color: inherit;
  }
  .news-date {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-claret);
  }
  .news-title {
    font-family: var(--font-serif);
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--color-heading);
  }
  .news-list a:hover .news-title { color: var(--color-claret); }
  .news-empty {
    font-style: italic;
    color: var(--color-text-muted);
    padding: 0.5rem 0;
  }

  @media (max-width: 768px) {
    .tile-row { grid-template-columns: 1fr; gap: 2rem; }
    .home-duo { grid-template-columns: 1fr; gap: 2rem; }
  }
</style>
```

- [ ] **Step 2: Create `FeaturedRecordings.astro`**

This task depends on `FeaturedRecordings.astro` existing. Create it as a sibling step before building. File at `src/components/FeaturedRecordings.astro`:

```astro
---
import { getCollection } from 'astro:content';
import SectionHead from './SectionHead.astro';
import RecordingTile from './RecordingTile.astro';

const base = import.meta.env.BASE_URL;
const all = await getCollection('featuredRecordings');
const items = all
  .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999))
  .slice(0, 3);
---
{items.length > 0 && (
  <section class="featured-recordings home-section">
    <SectionHead title="Featured Recordings" link={{ href: `${base}recording/`, label: 'All recordings →' }} />
    <div class="tile-row">
      {items.map((rec) => (
        <RecordingTile
          youtubeId={rec.data.youtubeId}
          title={rec.data.title}
          composer={rec.data.composer}
        />
      ))}
    </div>
  </section>
)}

<style>
  .tile-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .home-section { margin-bottom: 56px; }
  @media (max-width: 768px) {
    .tile-row { grid-template-columns: 1fr; gap: 2rem; }
  }
</style>
```

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/`. Confirm:
- Video hero renders with the italic caption beneath and "All recordings →" link in claret
- Drop-cap intro reads correctly with the deeper rust drop cap
- Ornament rule renders
- Upcoming Concerts section shows tiles (or the empty-state cross-hatch panel if no future events exist)
- Featured Recordings section renders three tiles with YouTube thumbnails
- Latest News list shows three latest posts; Scholars compact callout sits beside it
- All sections stack on mobile

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/FeaturedRecordings.astro
git commit -m "Rebuild homepage using new tile system and editorial primitives"
```

---

### Task 23: Verify empty-events state on homepage

**Files:** none (verification only)

- [ ] **Step 1: Temporarily filter all events out and rebuild**

In the dev session, temporarily edit `src/pages/index.astro`'s `upcoming` filter to:

```ts
const upcoming = []; // TEMP: simulate empty state
```

Rebuild and visit `/`.

- [ ] **Step 2: Confirm the empty-state panel renders**

Expected:
- Cross-hatched parchment panel appears in place of the tile row
- Headline reads "Our next concert hasn't been announced *yet*." with "yet" in italic claret
- Newsletter input + claret Subscribe button render beside the text on desktop
- They stack on mobile (resize browser to verify)
- Featured Recordings section still renders below — the page does not feel empty

- [ ] **Step 3: Revert the temporary edit and commit nothing**

Restore the original filter. Do not commit. Move on.

---

## Phase 8 — Events

### Task 24: Create `EventRow.astro`

**Files:**
- Create: `src/components/EventRow.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  slug: string;
  title: string;
  date: Date;
  venue: { name: string; address?: string };
  startTime?: string;
  endTime?: string;
  description: string;
  priceFrom?: string;
  past?: boolean;
}

const {
  slug, title, date, venue, startTime, endTime, description, priceFrom, past = false,
} = Astro.props;

const monthsLong = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const day = date.getDate();
const month = monthsLong[date.getMonth()];
const year = date.getFullYear();
const timeRange = startTime && endTime ? `${startTime} – ${endTime}` : startTime || '';

const baseUrl = import.meta.env.BASE_URL;
const href = `${baseUrl}events/${slug}/`;
const ctaLabel = past ? 'Read more →' : 'Book →';
---
<a class={`event-row${past ? ' past' : ''}`} href={href}>
  <div class="row-date">
    <div class="day">{day}</div>
    <span class="mo">{month}</span>
    <span class="yr">{year}</span>
  </div>
  <div class="row-title">
    <h3 set:html={title} />
    <p class="excerpt">{description}</p>
  </div>
  <div class="row-venue">
    <div class="name">{venue.name}</div>
    {venue.address && <div class="addr">{venue.address}</div>}
    {timeRange && <span class="time">{timeRange}</span>}
    {priceFrom && <span class="price">{priceFrom}</span>}
  </div>
  <span class="row-cta">{ctaLabel}</span>
</a>

<style>
  .event-row {
    display: grid;
    grid-template-columns: 92px 1.4fr 1fr auto;
    gap: 28px;
    align-items: center;
    padding: 22px 8px;
    border-top: 1px solid var(--color-border-strong);
    text-decoration: none;
    color: inherit;
    transition: background var(--transition);
  }
  .event-row:last-child { border-bottom: 1px solid var(--color-border-strong); }
  .event-row:hover { background: var(--color-claret-soft); }
  .event-row:focus-visible {
    outline: 2px solid var(--color-claret);
    outline-offset: 2px;
  }
  .event-row.past { opacity: 0.78; }
  .event-row.past .row-cta { color: var(--color-text-soft); border-color: rgba(60,40,20,0.3); }
  .event-row.past .row-date .mo { color: var(--color-text-soft); }

  .row-date {
    font-family: var(--font-serif);
    font-variant: small-caps;
    letter-spacing: 0.05em;
    text-align: left;
  }
  .row-date .day {
    font-size: 2rem;
    line-height: 1;
    font-weight: 500;
    color: var(--color-text);
  }
  .row-date .mo {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-top: 4px;
  }
  .row-date .yr {
    font-family: var(--font-sans);
    font-size: 0.65rem;
    color: var(--color-text-soft);
    letter-spacing: 0.1em;
  }
  .row-title h3 {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    line-height: 1.2;
    font-weight: 500;
    margin: 0 0 4px;
    color: var(--color-heading);
  }
  .row-title .excerpt {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    margin: 0;
    max-width: 42ch;
  }
  .row-venue {
    font-family: var(--font-sans);
    font-size: 0.82rem;
    color: var(--color-text);
    line-height: 1.55;
  }
  .row-venue .name { font-weight: 500; }
  .row-venue .addr { color: var(--color-text-soft); }
  .row-venue .time,
  .row-venue .price { color: var(--color-claret); display: block; margin-top: 4px; }
  .row-cta {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-claret);
    white-space: nowrap;
    border: 1px solid var(--color-claret);
    padding: 9px 14px;
    transition: background var(--transition), color var(--transition);
  }
  .event-row:hover .row-cta { background: var(--color-claret); color: var(--color-bg); }

  @media (max-width: 768px) {
    .event-row {
      grid-template-columns: 1fr;
      gap: 8px;
      padding: 18px 4px;
    }
    .row-date { display: flex; align-items: baseline; gap: 10px; }
    .row-date .mo { display: inline-block; margin-top: 0; }
    .row-cta { justify-self: start; margin-top: 6px; }
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/EventRow.astro && \
  git commit -m "Add EventRow.astro for events list page"
```

---

### Task 25: Rebuild `events/index.astro`

**Files:**
- Modify: `src/pages/events/index.astro`

- [ ] **Step 1: Replace the page body**

Keep the existing JSON-LD schema code, replace the body with:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TitleBlock from '../../components/TitleBlock.astro';
import EventRow from '../../components/EventRow.astro';
import OrnamentRule from '../../components/OrnamentRule.astro';
import EmptyState from '../../components/EmptyState.astro';
import { getCollection } from 'astro:content';

const allEvents = (await getCollection('events')).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
const now = new Date();
const upcoming = allEvents
  .filter((e) => e.data.date >= now)
  .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
const past = allEvents.filter((e) => e.data.date < now);

// Keep existing eventsListJsonLd construction here
const eventsListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Upcoming concerts — Alma Consort",
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "numberOfItems": upcoming.length,
  "itemListElement": upcoming.map((e, i) => {
    const iso = e.data.date.toISOString().split('T')[0];
    return {
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "MusicEvent",
        "name": e.data.title,
        "startDate": e.data.startTime ? `${iso}T${e.data.startTime}:00` : iso,
        "url": new URL(`${import.meta.env.BASE_URL}events/${e.id}/`, Astro.site).href,
        "location": { "@type": "Place", "name": e.data.venue.name },
      },
    };
  }),
};
---
<BaseLayout title="Concerts & Events | Alma Consort" description="Upcoming concerts and past events from the Alma Consort, a professional chamber choir based in London.">
  {upcoming.length > 0 && (
    <script slot="head" type="application/ld+json" set:html={JSON.stringify(eventsListJsonLd)} />
  )}
  <div class="container">
    <TitleBlock title="Concerts & Events" />

    <section class="list-section">
      <h2>Upcoming</h2>
      {upcoming.length > 0 ? (
        upcoming.map((event) => (
          <EventRow
            slug={event.id}
            title={event.data.title}
            date={event.data.date}
            venue={event.data.venue}
            startTime={event.data.startTime}
            endTime={event.data.endTime}
            description={event.data.description}
            priceFrom={event.data.priceFrom}
          />
        ))
      ) : (
        <EmptyState
          title={`No concerts on the schedule <span class="accent">just yet</span>.`}
          body="Subscribe to be the first to hear when dates are confirmed."
        />
      )}
    </section>

    {past.length > 0 && (
      <>
        <OrnamentRule />
        <section class="list-section">
          <h2>Past</h2>
          {past.map((event) => (
            <EventRow
              slug={event.id}
              title={event.data.title}
              date={event.data.date}
              venue={event.data.venue}
              startTime={event.data.startTime}
              endTime={event.data.endTime}
              description={event.data.description}
              priceFrom={event.data.priceFrom}
              past
            />
          ))}
        </section>
      </>
    )}
  </div>
</BaseLayout>

<style>
  .list-section h2 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    font-weight: 500;
    margin: 0 0 16px;
    color: var(--color-heading);
  }
  .list-section { margin-bottom: 36px; }
</style>
```

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/events/`. Confirm:
- TitleBlock "Concerts & Events" renders at the top
- Upcoming events listed as EventRows
- Past events listed beneath an ornament rule with reduced opacity
- If no upcoming events, the EmptyState shows

- [ ] **Step 3: Commit**

```bash
git add src/pages/events/index.astro
git commit -m "Rebuild events list using TitleBlock + EventRow"
```

---

### Task 26: Create `ConcertCard.astro`

**Files:**
- Create: `src/components/ConcertCard.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  date: Date;
  time?: string;
  venue: { name: string; address?: string };
  priceFrom?: string;
  directedBy?: string;
}
const { date, time, venue, priceFrom, directedBy } = Astro.props;

const monthsLong = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const day = date.getDate();
const month = monthsLong[date.getMonth()];
const year = date.getFullYear();
---
<aside class="concert-card">
  <div class="date-block">
    <div class="day">{day}</div>
    <div class="mo-yr">{month} {year}</div>
  </div>
  <div class="rows">
    {time && (
      <div class="crow">
        <div class="k">Time</div>
        <div class="v">{time}</div>
      </div>
    )}
    <div class="crow">
      <div class="k">Venue</div>
      <div class="v">
        {venue.name}
        {venue.address && <><br /><span class="addr">{venue.address}</span></>}
      </div>
    </div>
    {priceFrom && (
      <div class="crow">
        <div class="k">Tickets</div>
        <div class="v" set:html={priceFrom} />
      </div>
    )}
    {directedBy && (
      <div class="crow">
        <div class="k">Directed by</div>
        <div class="v">{directedBy}</div>
      </div>
    )}
  </div>
</aside>

<style>
  .concert-card {
    border: 1px solid var(--color-border-strong);
    background: linear-gradient(180deg, #fbf8ec, #f5efdf);
  }
  .date-block {
    padding: 26px 24px 20px;
    border-bottom: 1px solid var(--color-border-strong);
    text-align: center;
  }
  .day {
    font-family: var(--font-serif);
    font-size: 4rem;
    line-height: 1;
    font-weight: 500;
    font-variant: small-caps;
    color: var(--color-text);
  }
  .mo-yr {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--color-claret);
    margin-top: 8px;
  }
  .rows { padding: 8px 4px; }
  .crow {
    padding: 12px 20px;
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 10px;
    border-top: 1px dashed var(--color-border-strong);
  }
  .crow:first-child { border-top: none; }
  .crow .k {
    font-family: var(--font-sans);
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-soft);
    align-self: center;
  }
  .crow .v {
    font-family: var(--font-serif);
    font-size: 1rem;
    line-height: 1.35;
    color: var(--color-text);
  }
  .crow .v .addr {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/ConcertCard.astro && \
  git commit -m "Add ConcertCard.astro (single concert sidebar)"
```

---

### Task 27: Create `ProgrammeList.astro`

**Files:**
- Create: `src/components/ProgrammeList.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface ProgrammeItem {
  work: string;       // may include <span class="accent">…</span>
  composer: string;
  year?: string;
}
interface Props {
  items: ProgrammeItem[];
}
const { items } = Astro.props;
---
<section class="programme">
  <h2>Programme</h2>
  {items.map((item) => (
    <div class="prog-item">
      <div class="prog-work" set:html={item.work} />
      <div class="prog-composer">
        {item.composer}{item.year ? ` · ${item.year}` : ''}
      </div>
    </div>
  ))}
</section>

<style>
  .programme {
    max-width: var(--content-width);
    margin: 40px auto 16px;
  }
  .programme h2 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    font-weight: 500;
    border-bottom: 1px solid var(--color-border-strong);
    padding-bottom: 10px;
    margin: 0 0 18px;
    color: var(--color-heading);
  }
  .prog-item {
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: baseline;
  }
  .prog-item:last-child { border-bottom: none; }
  .prog-work {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.3;
    color: var(--color-text);
  }
  .prog-composer {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
  }
</style>
```

- [ ] **Step 2: Build & commit**

```bash
npm run build && git add src/components/ProgrammeList.astro && \
  git commit -m "Add ProgrammeList.astro"
```

---

### Task 28: Rebuild `events/[slug].astro`

**Files:**
- Modify: `src/pages/events/[slug].astro`

- [ ] **Step 1: Read existing file to preserve schema/JSON-LD**

Run: `cat src/pages/events/[slug].astro`
Note the existing `getStaticPaths`, `MusicEvent` JSON-LD, and any other page-level code.

- [ ] **Step 2: Rewrite the page body**

Replace the body markup (keeping `getStaticPaths`, JSON-LD, and any frontmatter logic) with:

```astro
---
// ... existing getStaticPaths + JSON-LD code stays ...
import BaseLayout from '../../layouts/BaseLayout.astro';
import TitleBlock from '../../components/TitleBlock.astro';
import ConcertCard from '../../components/ConcertCard.astro';
import ProgrammeList from '../../components/ProgrammeList.astro';
import Button from '../../components/Button.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map((event) => ({
    params: { slug: event.id },
    props: { event },
  }));
}

const { event } = Astro.props;
const { Content } = await event.render();
const baseUrl = import.meta.env.BASE_URL;

const date = event.data.date;
const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
const day = date.getDate();
const monthLong = date.toLocaleDateString('en-GB', { month: 'long' });
const year = date.getFullYear();
const eyebrow = `Concert · ${weekday} ${day} ${monthLong} ${year}`;

const time = event.data.startTime && event.data.endTime
  ? `${event.data.startTime} — ${event.data.endTime}`
  : event.data.startTime;

const programmeItems = (event.data.programme ?? []).map((p) => ({
  work: p.work,
  composer: p.composer,
}));

// Existing MusicEvent JSON-LD remains here unchanged
---
<BaseLayout title={`${event.data.title} | Alma Consort`} description={event.data.description}>
  <div class="container">
    <nav class="breadcrumb">
      <a href={`${baseUrl}events/`}>Events</a> &nbsp;/&nbsp; <span>{event.data.title}</span>
    </nav>

    <div class="concert-hero">
      <div>
        <div class="eyebrow">{eyebrow}</div>
        <h1 set:html={event.data.title} />
        <p class="deck">{event.data.description}</p>
        <div class="actions">
          {event.data.ticketUrl && (
            <Button variant="primary" href={event.data.ticketUrl} target="_blank" rel="noopener">Book tickets</Button>
          )}
          <Button variant="secondary" href={`${baseUrl}events/${event.id}/calendar.ics`}>Add to calendar</Button>
        </div>
      </div>
      <ConcertCard
        date={event.data.date}
        time={time}
        venue={event.data.venue}
        priceFrom={event.data.priceFrom}
        directedBy={(event.data.performers ?? []).find((p) => p.toLowerCase().includes('director')) ?? undefined}
      />
    </div>

    {programmeItems.length > 0 && <ProgrammeList items={programmeItems} />}

    <div class="prose">
      <Content />
    </div>
  </div>
</BaseLayout>

<style>
  .breadcrumb {
    padding: 22px 0 0;
    font-family: var(--font-sans);
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-soft);
  }
  .breadcrumb a { color: var(--color-accent); text-decoration: none; }

  .concert-hero {
    padding: 30px 0 40px;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 56px;
    align-items: start;
    border-bottom: 1px solid var(--color-border-strong);
    margin-bottom: 8px;
  }
  .concert-hero .eyebrow {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: 16px;
    font-weight: 500;
  }
  .concert-hero h1 {
    font-family: var(--font-serif);
    font-size: 3.4rem;
    line-height: 0.98;
    letter-spacing: -0.01em;
    font-weight: 500;
    margin: 0 0 18px;
    color: var(--color-heading);
  }
  .concert-hero .deck {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.15rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    max-width: 34ch;
    margin-bottom: 24px;
  }
  .actions {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }
  .prose {
    max-width: var(--content-width);
    margin: 24px auto 0;
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.7;
  }
  .prose :global(p) { margin: 0 0 1rem; }

  @media (max-width: 768px) {
    .concert-hero { grid-template-columns: 1fr; gap: 24px; }
    .concert-hero h1 { font-size: 2.4rem; }
  }
</style>
```

If `calendar.ics` route is not implemented, drop the "Add to calendar" button — confirm before commit.

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Visit any `/events/<slug>/`. Confirm:
- Breadcrumb at top
- Eyebrow + headline + deck on the left
- ConcertCard on the right with date block at top and dashed-rule rows
- Programme list (if the event has `programme` data)
- Page stacks on mobile

- [ ] **Step 4: Commit**

```bash
git add src/pages/events/[slug].astro
git commit -m "Rebuild single concert page with new hero, ConcertCard, ProgrammeList"
```

---

## Phase 9 — Recording page

### Task 29: Rebuild `recording.astro`

**Files:**
- Modify: `src/pages/recording.astro`

- [ ] **Step 1: Replace the body**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TitleBlock from '../components/TitleBlock.astro';
import OrnamentRule from '../components/OrnamentRule.astro';
import SectionHead from '../components/SectionHead.astro';
import RecordingTile from '../components/RecordingTile.astro';
import EnquiryBand from '../components/EnquiryBand.astro';
import { getCollection } from 'astro:content';
import { YOUTUBE_CHANNEL_URL } from '../lib/constants';

const recordings = (await getCollection('featuredRecordings'))
  .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999))
  .slice(0, 6);

const base = import.meta.env.BASE_URL;
---
<BaseLayout title="Choral Recording in London | Alma Consort" description="Professional choral recording in London: studio sessions for composers, producers, and labels, with in-house audio and video production by the Alma Consort.">
  <!-- existing JSON-LD scripts stay -->

  <div class="container">
    <TitleBlock
      title="Recording"
      pitch={`Studio sessions for composers, producers, and labels — with <span class="accent">in-house audio and video</span>, captured by a team that performs the music too.`}
    />

    <section class="caps">
      <div class="cap">
        <div class="lead-no">01 · Sessions</div>
        <h3>Studio &amp; on-site</h3>
        <p>We assemble the right forces for each session — small consort or full choir, sacred or secular — and deliver recordings that sit cleanly inside the project they're for.</p>
      </div>
      <div class="cap">
        <div class="lead-no">02 · Production</div>
        <h3>Audio &amp; video</h3>
        <p>Our in-house team handles capture and post — from multi-track recording to final delivery. Artistic and technical decisions stay aligned.</p>
      </div>
      <div class="cap">
        <div class="lead-no">03 · Releases</div>
        <h3>The Alma label</h3>
        <p>Alongside session work, we produce our own releases — Renaissance polyphony, contemporary commissions, jazz arrangements, and popular repertoire.</p>
      </div>
    </section>

    <OrnamentRule />

    <section class="recordings">
      <SectionHead title="Selected Recordings" link={{ href: YOUTUBE_CHANNEL_URL, label: 'YouTube channel →', target: '_blank', rel: 'noopener' }} />
      <div class="video-grid">
        {recordings.map((rec) => (
          <RecordingTile
            youtubeId={rec.data.youtubeId}
            title={rec.data.title}
            composer={rec.data.composer}
          />
        ))}
      </div>
    </section>

    <section class="process">
      <div>
        <h2>How a session works</h2>
        <p class="lede">From a first conversation to delivered masters, sessions typically run on a four-week cadence — flexible to deadline and forces.</p>
      </div>
      <div class="steps">
        <div class="step"><div class="step-no">i</div><div><h3>Conversation</h3><p>You send the score or brief. We discuss forces, timeline, venue, and budget. No commitment until both sides are confident in the fit.</p></div></div>
        <div class="step"><div class="step-no">ii</div><div><h3>Preparation</h3><p>Singers receive parts and recordings ahead of the session. Our directors lead any preliminary rehearsal.</p></div></div>
        <div class="step"><div class="step-no">iii</div><div><h3>Capture</h3><p>In-studio or on-site, with our own audio and video team. You're welcome in the control room throughout.</p></div></div>
        <div class="step"><div class="step-no">iv</div><div><h3>Delivery</h3><p>Edited and mixed to your spec. Masters and video stems delivered within two to three weeks of the session.</p></div></div>
      </div>
    </section>

    <EnquiryBand
      title={`Discuss a <span class="accent">session</span>`}
      body="Composers, producers, labels, and creative agencies — we welcome enquiries of any scale."
      primaryHref={`${base}contact/`}
      primaryLabel="Make an enquiry"
      secondaryHref="mailto:hello@almaconsort.com"
      secondaryLabel="Email directly"
    />
  </div>
</BaseLayout>

<style>
  .caps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
    margin-bottom: 24px;
  }
  .cap .lead-no {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-claret);
    margin-bottom: 6px;
  }
  .cap h3 {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    font-variant: small-caps;
    letter-spacing: 0.06em;
    font-weight: 500;
    margin: 0 0 10px;
    color: var(--color-heading);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-claret-border);
  }
  .cap p {
    font-family: var(--font-serif);
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-text);
    margin: 0;
  }

  .recordings { margin-bottom: 56px; }
  .video-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .process {
    padding: 16px 0 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
  }
  .process h2 {
    font-family: var(--font-serif);
    font-size: 2rem;
    line-height: 1;
    font-variant: small-caps;
    letter-spacing: -0.005em;
    font-weight: 500;
    margin: 0 0 16px;
    color: var(--color-heading);
  }
  .process .lede {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.15rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
  }
  .steps { display: grid; gap: 18px; }
  .step {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 18px;
    padding: 14px 0;
    border-top: 1px solid var(--color-border);
  }
  .step:first-child { border-top: none; padding-top: 0; }
  .step-no {
    font-family: var(--font-serif);
    font-variant: small-caps;
    font-size: 1.6rem;
    color: var(--color-claret);
    line-height: 1;
    letter-spacing: 0.04em;
  }
  .step h3 {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-weight: 500;
    margin: 0 0 4px;
    color: var(--color-heading);
  }
  .step p {
    font-family: var(--font-sans);
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 768px) {
    .caps { grid-template-columns: 1fr; gap: 2rem; }
    .video-grid { grid-template-columns: 1fr; gap: 2rem; }
    .process { grid-template-columns: 1fr; gap: 2rem; }
  }
</style>
```

Preserve all `<script slot="head" type="application/ld+json">` blocks at the top of the file — copy them across into the new version.

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/recording/`. Confirm:
- TitleBlock with italic claret accent in the pitch
- Three capability columns
- Ornament rule
- Selected Recordings grid (2×3) with "YouTube channel →" right-aligned link
- Process section with roman numerals
- EnquiryBand at the bottom with primary + secondary buttons

- [ ] **Step 3: Commit**

```bash
git add src/pages/recording.astro
git commit -m "Rebuild recording page: capabilities, recordings grid, process, EnquiryBand"
```

---

## Phase 10 — About page

### Task 30: Rebuild `about.astro`

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Replace the page body**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TitleBlock from '../components/TitleBlock.astro';
import OrnamentRule from '../components/OrnamentRule.astro';
import SectionHead from '../components/SectionHead.astro';
import BioPlate from '../components/BioPlate.astro';
import ScholarsCallout from '../components/ScholarsCallout.astro';

// Optionally import director portraits — only if files exist.
// If you don't have them yet, leave these imports commented out and the bio
// plates will render their monogram fallback.
// import lucaPhoto from '../assets/directors/luca-wetherall.jpg';
// import izzyPhoto from '../assets/directors/izzy-mohan.jpg';
---
<BaseLayout title="About the Alma Consort" description="A professional chamber choir of young London singers directed by Luca Wetherall and Izzy Mohan. We perform classical, contemporary, jazz, and popular repertoire on the concert platform and in the recording studio.">
  <div class="container">
    <TitleBlock
      title="About"
      pitch={`A professional chamber choir of young London singers — performing <span class="accent">classical, contemporary, jazz, and popular repertoire</span> on the concert platform and in the recording studio.`}
    />

    <div class="intro">
      <p class="drop-cap">
        The <strong>Alma Consort</strong> is a professional chamber choir of young London singers. We perform across classical, contemporary, jazz, and popular repertoire, on the concert platform and in the recording studio. We run our own audio and video production. That lets us record to the same standard in the studio or on location.
      </p>
    </div>

    <div class="ensemble">
      <p>Our singers are young professionals working across London's choral scene. Many hold positions with leading ensembles and cathedral choirs, and carry experience from both concert and liturgical work. We scale the ensemble to the music: a small consort for chamber polyphony, a fuller choir for larger forces.</p>
    </div>

    <OrnamentRule />

    <section class="directors">
      <SectionHead title="Directors" />
      <div class="bios-grid">
        <BioPlate
          name="Luca Wetherall"
          role="Director"
          roleTags={["Director", "Conductor", "Singer"]}
          monogramSubtitle="Conductor · Singer · Pianist"
        >
          <p>Luca Wetherall is a conductor, singer, and pianist. He is Director of Music and Organist at St Mary's Acton and Choral Director at St John the Baptist, Holland Road.</p>
          <p>A Clarendon Scholar at the University of Oxford, his doctoral research focuses on popular music, and he tutors at the Faculty of Music. As a singer, he performs regularly with leading ensembles in London and elsewhere. He programmes with scholarly depth and draws balanced, expressive sound from choirs of any size.</p>
        </BioPlate>

        <BioPlate
          name="Izzy Mohan"
          role="Director"
          roleTags={["Director", "Pianist", "Conductor"]}
          monogramSubtitle="Pianist · Conductor · Singer"
        >
          <p>Izzy Mohan is a pianist, conductor, and singer. She is Director of Music at St Mary's Harrow-on-the-Hill, where she runs the choral and organ programme.</p>
          <p>A graduate of the University of Oxford with a First Class degree, she holds a Master of Music from the Royal Academy of Music, where she was awarded the Ruth Harte Scholarship. She has performed at the Royal Festival Hall, the Austrian Cultural Forum, and the Oxford International Song Festival. She conducts with a pianist's ear for texture and colour.</p>
        </BioPlate>
      </div>
    </section>

    <ScholarsCallout variant="full" />
  </div>
</BaseLayout>

<style>
  .intro {
    max-width: 720px;
    margin: 0 auto 8px;
  }
  .intro p {
    font-size: 1.15rem;
    line-height: 1.75;
    color: var(--color-text);
  }
  .ensemble {
    max-width: 720px;
    margin: 0 auto 16px;
  }
  .ensemble p {
    font-size: 1.1rem;
    line-height: 1.75;
    color: var(--color-text);
  }

  .directors { margin-bottom: 36px; }
  .bios-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  @media (max-width: 768px) {
    .bios-grid { grid-template-columns: 1fr; gap: 2rem; }
  }
</style>
```

When director portraits become available, uncomment the imports at the top of the file and add `photo={lucaPhoto}` and `photo={izzyPhoto}` props to the respective `BioPlate` calls (plus `photoAlt` strings).

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/about/`. Confirm:
- TitleBlock at top with italic claret pitch
- Drop-cap intro paragraph
- Ensemble paragraph flows below — **no "The Ensemble" subheading**
- Ornament rule
- Two BioPlates side-by-side in no-photo state (large claret monograms LW and IM)
- ScholarsCallout (full variant) at the bottom

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "Rebuild about page with TitleBlock + BioPlates + ScholarsCallout"
```

---

## Phase 11 — Secondary pages

### Task 31: Scholars page — TitleBlock + token adoption

**Files:**
- Modify: `src/pages/scholars.astro`

- [ ] **Step 1: Read existing file**

Run: `cat src/pages/scholars.astro`

- [ ] **Step 2: Wrap the page in TitleBlock + token-aware markup**

Add at the top of the page body:

```astro
import TitleBlock from '../components/TitleBlock.astro';
import OrnamentRule from '../components/OrnamentRule.astro';
```

Replace any existing `<h1>` and intro paragraph with:

```astro
<TitleBlock
  title="Alma Scholars"
  pitch={`Mentoring the <span class="accent">next generation</span> of young choral singers through performance and recording opportunities.`}
/>
```

Replace any `<Divider />` calls with `<OrnamentRule />`. Replace any ad-hoc CTA buttons with `<Button variant="primary" href="…">Label</Button>` / `<Button variant="secondary" href="…">Label</Button>`. Remove any per-page colour literals (`#c4621c`, `#3c3c3c`, etc.) from the `<style>` block — they should now resolve from tokens.

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/scholars/`. Confirm TitleBlock renders, no colour regressions, buttons use the new style.

- [ ] **Step 4: Commit**

```bash
git add src/pages/scholars.astro
git commit -m "Scholars page: adopt TitleBlock, tokens, new buttons"
```

---

### Task 32: Work With Us page — TitleBlock + ServiceCard restyle

**Files:**
- Modify: `src/pages/work-with-us.astro`
- Modify: `src/components/ServiceCard.astro`

- [ ] **Step 1: Add TitleBlock to the page**

In `work-with-us.astro`, import and use TitleBlock + OrnamentRule similarly to the Scholars task. Replace existing `<h1>` and pitch paragraph with the `<TitleBlock title="Work With Us" pitch="…" />` pattern.

- [ ] **Step 2: Restyle `ServiceCard.astro`**

Read the existing file (`cat src/components/ServiceCard.astro`) and replace its `<style>` block contents with the capabilities-row pattern from the spec:

```css
.service-card { display: grid; gap: 8px; }
.service-card .lead-no {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-claret);
  margin-bottom: 4px;
}
.service-card h3 {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-variant: small-caps;
  letter-spacing: 0.06em;
  font-weight: 500;
  margin: 0 0 8px;
  color: var(--color-heading);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-claret-border);
}
.service-card p {
  font-family: var(--font-serif);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0 0 8px;
}
```

If the existing component takes a numbered prop, render the lead-no. Otherwise, render only the heading + body and the page can wrap the cards in a 3-column grid.

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/work-with-us/`. Confirm TitleBlock + restyled service cards.

- [ ] **Step 4: Commit**

```bash
git add src/pages/work-with-us.astro src/components/ServiceCard.astro
git commit -m "Work With Us: TitleBlock + restyle ServiceCard"
```

---

### Task 33: Contact page — TitleBlock + new form styles

**Files:**
- Modify: `src/pages/contact.astro`

- [ ] **Step 1: Wrap with TitleBlock**

Replace the existing `<h1>` and intro with `<TitleBlock title="Contact" pitch="…" />`. The form inputs already use the new `.input` class from Task 9.

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/contact/`. Confirm TitleBlock + new form styling.

- [ ] **Step 3: Commit**

```bash
git add src/pages/contact.astro
git commit -m "Contact page: adopt TitleBlock"
```

---

### Task 34: Blog list page — TitleBlock + BlogCard restyle

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/components/BlogCard.astro`

- [ ] **Step 1: Add TitleBlock to the page**

In `blog/index.astro`, import and use TitleBlock with `title="News"` (or whatever copy is in use). Wrap the list of `BlogCard`s as-is.

- [ ] **Step 2: Restyle `BlogCard.astro`**

Read the existing file. Replace its markup + styles with the EventRow-like pattern:

```astro
---
interface Props {
  slug: string;
  title: string;
  date: Date;
  description: string;
}
const { slug, title, date, description } = Astro.props;
const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const baseUrl = import.meta.env.BASE_URL;
---
<a class="blog-card" href={`${baseUrl}blog/${slug}/`}>
  <div class="date">{dateStr}</div>
  <div class="body">
    <h3 set:html={title} />
    <p>{description}</p>
  </div>
  <span class="cta">Read more →</span>
</a>

<style>
  .blog-card {
    display: grid;
    grid-template-columns: 130px 1fr auto;
    gap: 28px;
    align-items: center;
    padding: 22px 8px;
    border-top: 1px solid var(--color-border-strong);
    text-decoration: none;
    color: inherit;
    transition: background var(--transition);
  }
  .blog-card:last-child { border-bottom: 1px solid var(--color-border-strong); }
  .blog-card:hover { background: var(--color-claret-soft); }
  .date {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-claret);
  }
  .body h3 {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    line-height: 1.2;
    font-weight: 500;
    margin: 0 0 4px;
    color: var(--color-heading);
  }
  .body p {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.5;
    max-width: 56ch;
  }
  .cta {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-claret);
    white-space: nowrap;
    border: 1px solid var(--color-claret);
    padding: 9px 14px;
  }
  .blog-card:hover .cta { background: var(--color-claret); color: var(--color-bg); }
  @media (max-width: 768px) {
    .blog-card { grid-template-columns: 1fr; gap: 8px; }
    .cta { justify-self: start; }
  }
</style>
```

- [ ] **Step 3: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/blog/`. Confirm TitleBlock + new BlogCard rows.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro src/components/BlogCard.astro
git commit -m "Blog list: TitleBlock + restyle BlogCard as editorial row"
```

---

### Task 35: Single blog post — TitleBlock for post heading

**Files:**
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Replace the post heading**

In the layout for an individual blog post, replace the existing `<h1>{frontmatter.title}</h1>` with:

```astro
<TitleBlock title={frontmatter.title} />
```

(Import `TitleBlock` at the top.)

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit any blog post. Confirm the TitleBlock pattern.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "Single blog post: use TitleBlock for heading"
```

---

### Task 36: 404 page — TitleBlock + primary button home

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Replace the page body**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TitleBlock from '../components/TitleBlock.astro';
import Button from '../components/Button.astro';
const base = import.meta.env.BASE_URL;
---
<BaseLayout title="Not found | Alma Consort" description="The page you're looking for doesn't exist." noindex>
  <div class="container">
    <TitleBlock
      title="Not found"
      pitch={`The page you're looking for doesn't exist. <span class="accent">Try the homepage</span>, or browse upcoming events.`}
    />
    <div class="actions">
      <Button variant="primary" href={base} arrow>Back to home</Button>
      <Button variant="secondary" href={`${base}events/`}>See upcoming events</Button>
    </div>
  </div>
</BaseLayout>

<style>
  .actions {
    display: flex;
    gap: 14px;
    margin-top: 24px;
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 2: Build & visually verify**

Run: `npm run build && npm run dev`
Visit `/nonexistent-path/`. Confirm the 404 page styled correctly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "404 page: TitleBlock + primary button home"
```

---

## Phase 12 — Print styles + accessibility pass

### Task 37: Extend `@media print` block in `global.css`

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Append print rules for the new components**

Find the existing `@media print` block (at the bottom of `global.css`). Add the following selectors to the existing `display: none` rule:

```css
@media print {
  /* ... existing rules ... */
  .empty-state,
  .scholars-callout,
  .enquiry-band,
  .featured-recordings,
  .ornament-rule,
  .btn-primary,
  .btn-secondary,
  .section-head a {
    display: none !important;
  }
  .concert-tile .plate.photo::after { display: none !important; }
  .concert-tile .plate.np { background: none !important; border: 1px solid #000 !important; }
  .recording-tile { display: none !important; }    /* recordings are video */
}
```

- [ ] **Step 2: Build & verify print preview**

Run: `npm run build && npm run dev`
Open the homepage, single concert page, and About page in the browser. Use the browser's print preview (Cmd+P / Ctrl+P) to confirm:
- No overlays, no buttons, no recording tiles in print
- Concert plates render with a thin black border, no decorative background
- Concert detail card still shows in print on the single concert page

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Extend print styles to hide new components and decorative chrome"
```

---

### Task 38: Manual accessibility verification

**Files:** none (verification only)

- [ ] **Step 1: Run Lighthouse on five representative pages**

Run: `npm run build && npm run preview`
Open in browser, then for each of: `/`, `/recording/`, `/events/`, `/about/`, a single `/events/<slug>/`:
- Open DevTools → Lighthouse → Run audit on Mobile + Desktop
- Confirm accessibility score ≥ 95 on every page
- Confirm performance ≥ 90 on `/` and `/recording/`

- [ ] **Step 2: Keyboard navigation pass**

For each page above:
- Tab through every interactive element
- Confirm every focused element shows a visible focus ring
- Confirm the skip-to-content link works
- Confirm the active nav link is correctly indicated by colour (not colour alone — also the underline)

- [ ] **Step 3: Contrast spot-check**

Use a browser contrast extension (e.g., axe DevTools) on:
- Photo plate cream-on-dark caption — should pass ≥ 4.5:1 in the darkened area
- Meta line `--color-text-muted` on parchment — passes ≥ 4.5:1 at 0.78rem
- Claret on parchment — passes ≥ 4.5:1

Document any failures and fix before continuing. If a fix requires changing a token, return to Task 1 and propagate.

- [ ] **Step 4: Commit nothing (verification only) — if fixes were needed, commit them in their own task**

---

## Phase 13 — Deprecation cleanup

### Task 39: Deprecate replaced components

**Files:**
- Modify: `src/components/Divider.astro`
- Modify: `src/components/EventCard.astro`
- Modify: `src/components/BioCard.astro`
- Modify: `src/components/FeatureCard.astro`

- [ ] **Step 1: Confirm no remaining references**

For each file run:
```bash
grep -rn 'Divider' src/ --include='*.astro' --include='*.ts' | grep -v 'src/components/Divider.astro'
grep -rn 'EventCard' src/ --include='*.astro' --include='*.ts' | grep -v 'src/components/EventCard.astro'
grep -rn 'BioCard' src/ --include='*.astro' --include='*.ts' | grep -v 'src/components/BioCard.astro'
grep -rn 'FeatureCard' src/ --include='*.astro' --include='*.ts' | grep -v 'src/components/FeatureCard.astro'
```

Expected: each grep returns zero hits. If any return results, the page that still imports the deprecated component needs to be updated before continuing.

- [ ] **Step 2: Add @deprecated comment to each file**

Prepend each of the four files with a single-line frontmatter comment inside the existing component-script block (or at the very top if outside any block):

```astro
---
/**
 * @deprecated Superseded by <NewComponent>.astro as of 2026-05-25 editorial uplift.
 * Will be removed in a follow-up PR.
 */
---
```

Replace `<NewComponent>` with: `OrnamentRule` (for Divider), `ConcertTile + EventRow` (for EventCard), `BioPlate` (for BioCard), and `ServiceCard or capabilities-row pattern` (for FeatureCard — confirm the actual replacement during the audit).

- [ ] **Step 3: Build & commit**

```bash
npm run build
git add src/components/Divider.astro src/components/EventCard.astro src/components/BioCard.astro src/components/FeatureCard.astro
git commit -m "Mark Divider/EventCard/BioCard/FeatureCard as @deprecated"
```

---

### Task 40: Run the spec's Verification checklist

**Files:** none (verification only)

- [ ] **Step 1: Tokens & build**

```bash
grep -rn "#c4621c\|#3c3c3c\|#f8f5ec" src/ --include='*.astro' | grep -v 'global.css'
```
Expected: zero hits in component files (`global.css` may contain colour literals).

```bash
grep -rn "Cormorant Garamond" src/ | grep -v 'global.css'
```
Expected: zero hits outside `global.css`.

```bash
npm run build
```
Expected: zero warnings.

```bash
grep -c 'anthropic\|openai' package.json
```
Expected: 0 — no new runtime dependencies added.

- [ ] **Step 2: Visual consistency**

Visit every page (`/`, `/about/`, `/events/`, any `/events/<slug>/`, `/recording/`, `/scholars/`, `/work-with-us/`, `/contact/`, `/blog/`, any `/blog/<slug>/`, `/404/` via nonexistent URL). Confirm:
- Single `<h1>` per page, rendered via TitleBlock
- No underline-only "ghost" buttons remain
- No `text-decoration: underline` in any new component CSS

- [ ] **Step 3: Components**

- ConcertTile renders correctly with: `photo` set + `composers` set + `altTitle` set + none of those set (the four scenarios). Use temporary event documents in `src/content/events/` if needed.
- RecordingTile renders all three on homepage and six on `/recording/`.
- BioPlate renders photo state when `src/assets/directors/{slug}.jpg` exists; monogram state otherwise.
- EmptyState renders with and without `newsletter` prop.
- Homepage with zero upcoming events still shows Featured Recordings.
- Single concert page renders sidebar on desktop, stacked on mobile.

- [ ] **Step 4: Brand constants**

```bash
grep -rn 'youtube.com/@almaconsort\|youtube.com/watch\|i.ytimg.com' src/ --include='*.astro' --include='*.ts' | grep -v 'src/lib/constants.ts'
```
Expected: zero hits — every reference goes through `constants.ts`.

- [ ] **Step 5: Lighthouse + a11y**

Re-run the audits from Task 38. Confirm a11y ≥ 95 on the five pages and performance ≥ 90 on `/` and `/recording/`.

- [ ] **Step 6: Print**

Print-preview homepage and a single concert page. Confirm no overlays, no buttons, no recordings.

- [ ] **Step 7: Migration**

Confirm `@deprecated` comments are present on Divider, EventCard, BioCard, FeatureCard.

- [ ] **Step 8: Final commit (only if any fixes were needed)**

If steps 1–7 surfaced fixes, commit them with descriptive messages. If everything passed, no commit needed — the verification step is documentation only.

---

## Final notes

- **PR strategy.** All commits sit on a single branch (the worktree branch). The final PR description should reference the spec at `docs/superpowers/specs/2026-05-25-editorial-uplift-design.md` and the verification checklist in the spec.
- **Director photos.** When director portrait files arrive at `src/assets/directors/luca-wetherall.jpg` and `src/assets/directors/izzy-mohan.jpg`, uncomment the imports in `src/pages/about.astro` and pass `photo={…}` + `photoAlt="…"` props to the BioPlate calls. No other change needed.
- **Adding new featured recordings.** Drop a new `.md` file into `src/content/featuredRecordings/` with the frontmatter shape from Task 21, give it an `order` value, and rebuild. The homepage shows the lowest three; the recording page shows the lowest six.
- **If `astro check` is not installed**, install it: `npx astro add typescript` (or it ships as part of `astro` 5.x — `npx astro check` should work without installation).

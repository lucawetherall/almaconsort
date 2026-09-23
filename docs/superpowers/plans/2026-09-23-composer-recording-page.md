# Composer Recording Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/recording/composers/`, a page that sells the Composer Recording Day with published Standard and Emerging prices, and route composer enquiries into the existing contact form.

**Architecture:** Prices live in one typed module (`src/lib/composer-recording.ts`) that the price tables, the JSON-LD and the "from £…" teaser all read from. A small `PriceTable` component renders both tables. The page is a static Astro route that reuses the editorial primitives; the contact form gains one option, a URL-param preselect and a contextual hint.

**Tech Stack:** Astro 5 (static), TypeScript strict, scoped `<style>` blocks, vanilla inline JS. No test runner exists in this repo: verification is `npm run check`, `npm run build`, assertions against the built HTML in `dist/`, and a browser check via the `astro-dev` preview.

**Spec:** `docs/superpowers/specs/2026-09-23-composer-recording-page-design.md`

**Deviations from the spec (deliberate, found while reading the components):**
- `TitleBlock` has no eyebrow prop and no other page uses one with it; the "Recording" eyebrow is dropped. The breadcrumb trail already shows Recording › For Composers.
- The price table is a component (`src/components/PriceTable.astro`), not page-scoped markup, because the page renders two tables and the markup would otherwise be duplicated.
- `SectionHead` gains an optional `id` prop so sections can use `aria-labelledby` on its `<h2>`. Backwards-compatible: existing callers pass no `id`.
- The social media feature is an `h3` subsection inside the Add-ons section rather than a separate top-level section, since it explains one add-on.

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/composer-recording.ts` | Create | All prices, `formatPrice`, lowest-price constants |
| `src/components/PriceTable.astro` | Create | Accessible three-column price table |
| `src/components/SectionHead.astro` | Modify | Optional `id` on the `<h2>` |
| `src/components/Breadcrumbs.astro` | Modify | `composers` → "For Composers" label |
| `src/pages/recording/composers.astro` | Create | The page |
| `src/components/ContactForm.astro` | Modify | New option, `?type=composer` preselect, composer hint |
| `src/pages/recording.astro` | Modify | Teaser band linking to the new page |
| `src/pages/work-with-us.astro` | Modify | One sentence in the Recording card |
| `public/llms.txt` | Modify | Page entry |

All commands run from the worktree root: `/Users/lucawetherall/Documents/GitHub/almaconsort/.claude/worktrees/alma-consort-integration-e92a66`. Branch: `claude/recording-opportunities-page-a8793b` (already checked out).

---

### Task 1: Price data module

**Files:**
- Create: `src/lib/composer-recording.ts`

- [ ] **Step 1: Create the module**

```ts
/**
 * Composer Recording Day prices — single source of truth.
 *
 * Read by the price tables on /recording/composers/, that page's JSON-LD,
 * and the "from £…" teaser on /recording/. Change prices here only.
 *
 * ADD_ONS order matters: the last three are the flat-rate items (same price
 * on both tiers), and the page's footnote says "the last three". Keep them
 * at the end, or update the footnote.
 */

export interface PriceLine {
  label: string;
  detail?: string;
  /** GBP, whole pounds. Negative = discount. */
  standard: number;
  emerging: number;
}

export const PACKAGES: PriceLine[] = [
  { label: 'Audio only', standard: 395, emerging: 275 },
  { label: 'Audio and single camera', standard: 545, emerging: 375 },
  { label: 'Audio and two cameras', standard: 695, emerging: 475 },
];

export const ADD_ONS: PriceLine[] = [
  { label: 'Scrolling score video', detail: 'Synchronised to the recording', standard: 150, emerging: 105 },
  { label: 'Part-dominant mixes', detail: 'Four mixes, each bringing forward one part: soprano, alto, tenor, bass', standard: 120, emerging: 85 },
  { label: 'Written feedback', detail: 'From the conductor and singers', standard: 95, emerging: 65 },
  { label: 'Social media feature', detail: "On Alma Consort's channels", standard: 195, emerging: 135 },
  { label: 'Commercial release licence', detail: 'Streaming, sale and sync', standard: 250, emerging: 175 },
  { label: 'Rush delivery', detail: 'Seven days from recording', standard: 125, emerging: 95 },
  { label: 'Each additional minute beyond 3:00', standard: 95, emerging: 95 },
  { label: 'Second take', detail: 'Alternate tempo or interpretation', standard: 175, emerging: 175 },
  { label: 'Second piece on the same day', standard: -100, emerging: -100 },
];

/** "£395", or "−£100" (U+2212 minus) for discounts. */
export const formatPrice = (n: number): string =>
  n < 0 ? `−£${Math.abs(n)}` : `£${n}`;

export const LOWEST_STANDARD = Math.min(...PACKAGES.map((p) => p.standard));
export const LOWEST_EMERGING = Math.min(...PACKAGES.map((p) => p.emerging));
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors` (warnings/hints that pre-date this change are fine).

- [ ] **Step 3: Commit**

```bash
git add src/lib/composer-recording.ts
git commit -m "Add Composer Recording Day price data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Small component changes (SectionHead id, breadcrumb label)

**Files:**
- Modify: `src/components/SectionHead.astro` (frontmatter + `<h2>` line)
- Modify: `src/components/Breadcrumbs.astro` (`labelOverrides`)

- [ ] **Step 1: Add optional `id` to SectionHead**

Replace the frontmatter body:

```ts
interface Props {
  title: string;
  id?: string;   // lets a parent <section aria-labelledby> point at the <h2>
  link?: { href: string; label: string; target?: string; rel?: string };
}
const { title, id, link } = Astro.props;
```

and change `<h2 set:html={title} />` to:

```astro
  <h2 id={id} set:html={title} />
```

(Astro omits the attribute when `id` is undefined, so existing pages render identically.)

- [ ] **Step 2: Add the breadcrumb label override**

In `src/components/Breadcrumbs.astro`, change `labelOverrides` to:

```ts
const labelOverrides: Record<string, string> = {
  blog: 'News',
  thanks: 'Thank You',
  composers: 'For Composers',
};
```

- [ ] **Step 3: Build and confirm existing pages are unchanged**

Run: `npm run check && npm run build && grep -o '<h2[^>]*>Directors' dist/about/index.html`
Expected: build succeeds; the last command prints an `<h2 …>Directors` tag with **no** `id=` attribute.

- [ ] **Step 4: Commit**

```bash
git add src/components/SectionHead.astro src/components/Breadcrumbs.astro
git commit -m "Allow SectionHead id and label composers breadcrumb

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: PriceTable component

**Files:**
- Create: `src/components/PriceTable.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { formatPrice, type PriceLine } from '../lib/composer-recording';

interface Props {
  caption: string;      // visually hidden; announced by screen readers
  itemHeading: string;  // first column heading, e.g. "Package"
  rows: PriceLine[];
}
const { caption, itemHeading, rows } = Astro.props;
---
<table class="price-table">
  <caption class="visually-hidden">{caption}</caption>
  <thead>
    <tr>
      <th scope="col">{itemHeading}</th>
      <th scope="col" class="num">Standard</th>
      <th scope="col" class="num emerging">Emerging</th>
    </tr>
  </thead>
  <tbody>
    {rows.map((row) => (
      <tr>
        <th scope="row">
          <span class="label">{row.label}</span>
          {row.detail && <span class="detail">{row.detail}</span>}
        </th>
        <td class="num">{formatPrice(row.standard)}</td>
        <td class="num emerging">{formatPrice(row.emerging)}</td>
      </tr>
    ))}
  </tbody>
</table>

<style>
  .price-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 var(--space-5);
  }
  th, td {
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    vertical-align: baseline;
  }
  thead th {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--color-text-muted);
    padding: 0 0 10px;
    border-bottom: 1px solid var(--color-border-strong);
  }
  thead th.emerging { color: var(--color-claret); }
  tbody th {
    font-weight: normal;
    padding-right: var(--space-6);
  }
  .label {
    display: block;
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.35;
    color: var(--color-heading);
  }
  .detail {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--color-text-muted);
    margin-top: 2px;
  }
  /* Price columns shrink to their content; the label column takes the rest
     and wraps, so the table never overflows at 375px. */
  .num {
    width: 1%;
    white-space: nowrap;
    text-align: right;
    padding-left: var(--space-6);
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
  }
  thead th.num { font-family: var(--font-sans); font-size: 0.7rem; }
  td.emerging { color: var(--color-claret); }

  @media (max-width: 480px) {
    .num { padding-left: var(--space-4); }
    tbody th { padding-right: var(--space-2); }
    thead th { letter-spacing: 0.12em; }
  }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/PriceTable.astro
git commit -m "Add PriceTable component

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: The For Composers page

**Files:**
- Create: `src/pages/recording/composers.astro`

- [ ] **Step 1: Write the failing check**

Run: `npm run build && test -f dist/recording/composers/index.html && echo PRESENT || echo MISSING`
Expected: `MISSING`.

- [ ] **Step 2: Create the page**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TitleBlock from '../../components/TitleBlock.astro';
import SectionHead from '../../components/SectionHead.astro';
import OrnamentRule from '../../components/OrnamentRule.astro';
import EnquiryBand from '../../components/EnquiryBand.astro';
import PriceTable from '../../components/PriceTable.astro';
import {
  PACKAGES,
  ADD_ONS,
  LOWEST_STANDARD,
  formatPrice,
} from '../../lib/composer-recording';

const base = import.meta.env.BASE_URL;
const pageUrl = new URL(`${base}recording/composers/`, Astro.site).href;
---
<BaseLayout
  title="Record Your Choral Composition in London | Alma Consort"
  description={`Have your choral piece recorded and filmed by eight professional singers in London. Audio and video packages from ${formatPrice(LOWEST_STANDARD)}, with a discounted rate for student and recently graduated composers.`}
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Alma Consort — Composer Recording Day",
    "description": "Professional recording and filming of new choral works for composers, sung by eight professional singers in London, with a discounted rate for emerging composers.",
    "url": pageUrl,
    "provider": {
      "@type": "PerformingGroup",
      "name": "Alma Consort",
      "url": new URL(base, Astro.site).href
    },
    "areaServed": { "@type": "City", "name": "London" },
    "serviceType": "Choral Recording",
    "audience": { "@type": "Audience", "audienceType": "Composers" },
    "offers": PACKAGES.map((p) => ({
      "@type": "Offer",
      "name": p.label,
      "price": p.standard,
      "priceCurrency": "GBP",
      "url": pageUrl
    }))
  })} />

  <div class="container">
    <TitleBlock
      title="For Composers"
      pitch={`Hear your choral writing sung by <span class="accent">eight professional voices</span>, then recorded, filmed and mastered by our own team.`}
    />

    <section class="caps" aria-labelledby="how-heading">
      <h2 id="how-heading" class="visually-hidden">How it works</h2>
      <div class="cap">
        <div class="lead-no">01 · Schedule</div>
        <h3>Shared schedule</h3>
        <p>We fit your piece into our existing recording days, so you share the cost of singers, venue and production team, and pay a fraction of what a private session would cost.</p>
      </div>
      <div class="cap">
        <div class="lead-no">02 · Forces</div>
        <h3>Professional voices</h3>
        <p>Eight professional singers, a recording producer and a videographer, working from your score.</p>
      </div>
      <div class="cap">
        <div class="lead-no">03 · Delivery</div>
        <h3>A finished recording</h3>
        <p>One piece of up to three minutes: rehearsed, recorded, edited and mastered, with video if you want it.</p>
      </div>
    </section>

    <OrnamentRule />

    <section class="block" aria-labelledby="packages-heading">
      <SectionHead id="packages-heading" title="Packages" />
      <p class="lede">We record, edit and master one piece of up to three minutes.</p>
      <PriceTable
        caption="Core packages, at standard and emerging composer rates"
        itemHeading="Package"
        rows={PACKAGES}
      />
      <p class="note">Every package includes rehearsal and recording time, a stereo master in WAV and MP3, and a licence to use the recording in your portfolio, in competition entries, and in funding or academic applications.</p>
    </section>

    <section class="emerging-panel" aria-labelledby="emerging-heading">
      <h2 id="emerging-heading">Emerging Composer rate</h2>
      <p>You qualify if you are enrolled on a degree course, or if you graduated within the past three years. Send us evidence with your enquiry. Places at this rate are limited on each recording day.</p>
      <p>We ask two things in return: credit and tag us when you post the recording, and let us use a short excerpt in our own promotion.</p>
    </section>

    <section class="block" aria-labelledby="addons-heading">
      <SectionHead id="addons-heading" title="Add-ons" />
      <PriceTable
        caption="Add-ons, at standard and emerging composer rates"
        itemHeading="Add-on"
        rows={ADD_ONS}
      />
      <p class="note">The last three cost the same on both tiers, because they use recording time on the day rather than post-production.</p>

      <div class="feature">
        <h3>The social media feature</h3>
        <p>We sing choral and sacred repertoire, and our strongest posts have reached well beyond that audience. A feature puts your video on our channels with full composer credit and a link you choose.</p>
        <p>We sell the placement. We cannot promise you a view count. We publish work that suits the channel, and we will tell you when you enquire whether we think yours does. If we change our minds after the recording, we return the fee.</p>
      </div>
    </section>

    <OrnamentRule />

    <section class="process" aria-labelledby="needs-heading">
      <div>
        <h2 id="needs-heading">What we need from you</h2>
        <p class="lede">A clear score, in good time, written for the voices we have.</p>
      </div>
      <div class="steps">
        <div class="step"><div class="step-no">i</div><div><h3>Your score, four weeks ahead</h3><p>Send the score, and the parts if you have them, four weeks before the recording. We will confirm that your piece fits the time available, or tell you what would need to change.</p></div></div>
        <div class="step"><div class="step-no">ii</div><div><h3>Eight voices</h3><p>Write for eight voices. Talk to us before you enquire if your piece calls for instruments, electronics or extended techniques.</p></div></div>
        <div class="step"><div class="step-no">iii</div><div><h3>Forty-five minutes per piece</h3><p>That covers a well-notated three-minute work of moderate difficulty. Denser writing may need the second-take add-on or a longer slot, and we will say so when we read the score.</p></div></div>
      </div>
    </section>

    <EnquiryBand
      title={`Record your <span class="accent">piece</span>`}
      body="Tell us about your piece: its length and voicing, the package you're interested in, and whether you're applying for the Emerging rate."
      primaryHref={`${base}contact/?type=composer`}
      primaryLabel="Enquire about a recording"
    />
  </div>
</BaseLayout>

<style>
  .caps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
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

  .block { margin-bottom: var(--space-10); }
  .block .lede {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.15rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0 0 var(--space-4);
  }
  .note {
    font-family: var(--font-sans);
    font-size: 0.88rem;
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0;
    max-width: 62ch;
  }

  .emerging-panel {
    background: var(--color-bg-white);
    border: 1px solid var(--color-claret-border);
    border-radius: var(--radius-md);
    padding: 1.75rem 2rem;
    margin: 0 0 var(--space-12);
  }
  .emerging-panel h2 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-variant: small-caps;
    letter-spacing: 0.04em;
    font-weight: 500;
    color: var(--color-claret);
    margin: 0 0 0.75rem;
  }
  .emerging-panel p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-text);
    margin: 0 0 0.75rem;
    max-width: 62ch;
  }
  .emerging-panel p:last-child { margin-bottom: 0; }

  .feature {
    margin-top: var(--space-8);
    max-width: 62ch;
  }
  .feature h3 {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-variant: small-caps;
    letter-spacing: 0.04em;
    font-weight: 500;
    color: var(--color-heading);
    margin: 0 0 0.5rem;
  }
  .feature p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-text);
    margin: 0 0 0.75rem;
  }

  .process {
    padding: 0 0 40px;
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
    .process { grid-template-columns: 1fr; gap: 2rem; }
    .emerging-panel { padding: 1.25rem 1.25rem; }
    .step { grid-template-columns: 40px 1fr; gap: 12px; }
  }
</style>
```

- [ ] **Step 3: Typecheck, build, and verify the page exists alongside /recording/**

Run: `npm run check && npm run build && ls dist/recording/index.html dist/recording/composers/index.html`
Expected: both paths listed. If `astro build` reports a route conflict between `recording.astro` and `recording/`, run `git mv src/pages/recording.astro src/pages/recording/index.astro`, change its relative imports from `../` to `../../`, and re-run.

- [ ] **Step 4: Verify content in the built HTML**

Run:
```bash
f=dist/recording/composers/index.html
grep -q 'For Composers</span>' $f && echo breadcrumb-ok
grep -q '£395' $f && grep -q '£275' $f && grep -q '−£100' $f && echo prices-ok
grep -q 'Part-dominant mixes' $f && ! grep -qi 'multitrack' $f && echo addons-ok
grep -q 'contact/?type=composer' $f && echo enquiry-ok
grep -o '"offers":\[[^]]*\]' $f | head -c 300; echo
```
Expected: `breadcrumb-ok`, `prices-ok`, `addons-ok`, `enquiry-ok`, then a JSON fragment with three `Offer` objects priced 395, 545, 695.

- [ ] **Step 5: Commit**

```bash
git add src/pages/recording/composers.astro
git commit -m "Add For Composers recording page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact form — composer option, preselect, hint

**Files:**
- Modify: `src/components/ContactForm.astro`

- [ ] **Step 1: Write the failing check**

Run: `grep -c 'Composer Recording Day' dist/contact/index.html`
Expected: `0`.

- [ ] **Step 2: Add the option**

After `<option value="Recording Project">Recording Project</option>` add:

```astro
      <option value="Composer Recording Day">Composer Recording Day</option>
```

- [ ] **Step 3: Add the hint under the message field**

Replace the message `form-group` with:

```astro
  <div class="form-group">
    <label for="message">Message <span class="required-marker" aria-hidden="true">*</span></label>
    <textarea id="message" name="message" rows="6" class="input" required aria-required="true"></textarea>
    <p class="field-hint" id="composer-hint" hidden>Tell us the piece's length and voicing, which package you're interested in, and whether you're applying for the Emerging rate.</p>
  </div>
```

- [ ] **Step 4: Replace the inline script**

```astro
<script is:inline>
  document.addEventListener('DOMContentLoaded', function() {
    var select = document.getElementById('enquiry-type');
    var dateGroup = document.getElementById('date-group');
    var message = document.getElementById('message');
    var composerHint = document.getElementById('composer-hint');
    if (!select) return;

    // The For Composers page links here as /contact/?type=composer
    if (new URLSearchParams(window.location.search).get('type') === 'composer') {
      select.value = 'Composer Recording Day';
    }

    var toggle = function() {
      if (dateGroup) {
        if (select.value === 'Event Engagement') {
          dateGroup.removeAttribute('hidden');
        } else {
          dateGroup.setAttribute('hidden', '');
        }
      }
      if (composerHint && message) {
        if (select.value === 'Composer Recording Day') {
          composerHint.removeAttribute('hidden');
          message.setAttribute('aria-describedby', 'composer-hint');
        } else {
          composerHint.setAttribute('hidden', '');
          message.removeAttribute('aria-describedby');
        }
      }
    };
    select.addEventListener('change', toggle);
    toggle();
  });
</script>
```

- [ ] **Step 5: Add the hint style**

In the component's `<style>`, after `.form-group { … }`:

```css
  .field-hint {
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--color-text-muted);
    margin: 0.4rem 0 0;
  }
```

- [ ] **Step 6: Build and verify**

Run: `npm run check && npm run build && grep -c 'Composer Recording Day' dist/contact/index.html`
Expected: `1` or more.

- [ ] **Step 7: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "Preselect composer enquiries on the contact form

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Link in from Recording, Work With Us and llms.txt

**Files:**
- Modify: `src/pages/recording.astro`
- Modify: `src/pages/work-with-us.astro`
- Modify: `public/llms.txt`

- [ ] **Step 1: Write the failing check**

Run: `grep -c 'recording/composers/' dist/recording/index.html dist/llms.txt`
Expected: `0` for both.

- [ ] **Step 2: Teaser band on /recording/**

Add to the imports in `src/pages/recording.astro`:

```ts
import { LOWEST_EMERGING, formatPrice } from '../lib/composer-recording';
```

Insert between the closing `</section>` of `.process` and `<EnquiryBand`:

```astro
    <aside class="composer-band" aria-labelledby="composer-band-heading">
      <p class="eyebrow">For composers</p>
      <h2 id="composer-band-heading">Composer Recording Days</h2>
      <p>Have a new choral piece recorded and filmed by eight professional singers, from {formatPrice(LOWEST_EMERGING)} at the Emerging Composer rate.</p>
      <a href={`${base}recording/composers/`}>Packages and prices →</a>
    </aside>
```

Add to its `<style>` (before the `@media` block):

```css
  .composer-band {
    background: var(--color-bg-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.5rem 1.75rem;
    margin: 0 0 var(--space-10);
  }
  .composer-band .eyebrow {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-claret);
    margin: 0 0 6px;
  }
  .composer-band h2 {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-variant: small-caps;
    letter-spacing: 0.04em;
    font-weight: 500;
    color: var(--color-heading);
    margin: 0 0 0.5rem;
  }
  .composer-band p:not(.eyebrow) {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-text);
    margin: 0 0 0.75rem;
  }
  .composer-band a {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-variant: small-caps;
    letter-spacing: 0.04em;
    color: var(--color-claret);
  }
```

- [ ] **Step 3: Work With Us card**

In `src/pages/work-with-us.astro`, change the Recording Sessions `description` to:

```astro
        description="Our singers are experienced session musicians, fluent in contemporary scores and Renaissance repertoire alike. Our production team records audio and video in-house. Composers can also book a place on one of our Composer Recording Days."
```

- [ ] **Step 4: llms.txt**

In `public/llms.txt`, directly after the `- [Recording](…)` line, add:

```
- [Composer Recording Day](https://www.almaconsort.com/recording/composers/): Recording and filming new choral works for composers, with published prices and a discounted Emerging Composer rate.
```

- [ ] **Step 5: Build and verify**

Run: `npm run check && npm run build && grep -c 'recording/composers/' dist/recording/index.html dist/llms.txt && grep -o 'from £[0-9]*' dist/recording/index.html`
Expected: counts ≥ 1 for both files; `from £275`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/recording.astro src/pages/work-with-us.astro public/llms.txt
git commit -m "Link composer recording page from Recording and Work With Us

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Browser verification

**Files:** none (verification only; fix in the relevant file if anything fails, then re-run from Step 1).

- [ ] **Step 1: Start the preview** — `preview_start` with `{ name: "astro-dev" }`, navigate to `http://localhost:4321/recording/composers/`.

- [ ] **Step 2: Console** — `read_console_messages` with `onlyErrors: true`. Expected: no errors.

- [ ] **Step 3: Structure** — `read_page`. Expected: breadcrumb "Home › Recording › For Composers"; h1 "For Composers"; sections Packages, Emerging Composer rate, Add-ons (with The social media feature), What we need from you; enquiry button to `/contact/?type=composer`.

- [ ] **Step 4: Narrow viewport** — `resize_window` preset `mobile`, reload, then `javascript_tool`:
  `({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })`
  Expected: `sw <= iw`. Screenshot the Packages and Add-ons tables at this width. Reset with preset `desktop`.

- [ ] **Step 5: Contact preselect** — navigate to `http://localhost:4321/contact/?type=composer`; `javascript_tool`:
  `({ v: document.getElementById('enquiry-type').value, hint: !document.getElementById('composer-hint').hidden, desc: document.getElementById('message').getAttribute('aria-describedby') })`
  Expected: `{ v: "Composer Recording Day", hint: true, desc: "composer-hint" }`.
  Then use `form_input` to set the select to "Event Engagement" and re-run a check for `#composer-hint` hidden = true and `#date-group` hidden = false.

- [ ] **Step 6: Recording teaser** — navigate to `/recording/`, confirm the "Composer Recording Days" band appears above the enquiry band and its link resolves to `/recording/composers/`.

- [ ] **Step 7: Final check and screenshot** — `npm run check && npm run build` once more; take a desktop screenshot of the composer page as proof.

---

## Deferred (not in this plan)

When the owner supplies the amended PDF: copy it to `public/downloads/alma-consort-composer-recording-day.pdf`, add `secondaryHref={`${base}downloads/alma-consort-composer-recording-day.pdf`}` / `secondaryLabel="Download the price sheet (PDF)"` to the page's `EnquiryBand`, and add "Full booking terms are in the price sheet." to its `body`.

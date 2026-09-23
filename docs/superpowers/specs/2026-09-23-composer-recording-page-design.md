# Composer Recording page — design

**Date:** 2026-09-23
**Status:** Approved in brainstorming, awaiting spec review
**Source:** `alma-consort-recording-day-price-sheet 2.pdf` (owner's price sheet), with the amendments below

## Goal

A dedicated page that sells Alma Consort's Composer Recording Day to composers: professional singers record, film and master a new choral piece, with published prices and a discounted Emerging Composer rate. Success = composers can understand the offer, see exactly what it costs, check whether they qualify for the Emerging rate, and send a well-formed enquiry.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Scheduling | **Rolling / on demand.** No dates on the page. Composers enquire; we fit pieces into our existing recording schedule, sometimes with only one or two composers on a day. |
| Enquiry route | **Existing contact form**, preselected via `/contact/?type=composer`. No new form. |
| Pricing visibility | **Full price list published**: packages and add-ons, Standard and Emerging side by side. |
| Capacity wording | **No fixed numbers.** Drop "six composers per day" and "two of the six places". Emerging places are described as limited. |
| Placement | **Sub-page `/recording/composers/`**, not in main nav. |
| Recordings strip | **Not included.** |
| Booking & terms section | **Not included** on the page. Terms live in the PDF. |
| Multitrack stems add-on | **Removed.** Replaced by part-dominant mixes (four: S, A, T, B). |

## Amendments to the price sheet

The page diverges from the current PDF in three places. The PDF must be updated by the owner before it is linked from the site:

1. Remove "We take six composers per day" and "We hold two of the six places at this rate".
2. Replace "split the cost between composers" framing with the rolling-schedule framing (the cost is shared because pieces are fitted into our existing recording schedule).
3. Replace "Multitrack stems, one file per voice — £120 / £85" with "Part-dominant mixes — £120 / £85".

Until the updated PDF is supplied, the page ships **without** the PDF download link and without the "Full booking terms are in the price sheet" line. Adding both later is a two-line change.

## Page: `src/pages/recording/composers.astro`

Route `/recording/composers/`. Global breadcrumbs render automatically. `Breadcrumbs.astro` title-cases the slug, which would print "Composers"; add `composers: 'For Composers'` to its `labelOverrides` map so the trail reads Home › Recording › For Composers.

> Note: `src/pages/recording.astro` exists as a file route. Astro allows `recording.astro` alongside a `recording/` directory; verify the build emits both `/recording/` and `/recording/composers/`. If it conflicts, move `recording.astro` to `recording/index.astro` with no content change.

### Head metadata (via BaseLayout props)

- `title`: "Record Your Choral Composition in London | Alma Consort"
- `description`: "Have your choral piece recorded and filmed by eight professional singers in London. Audio and video packages from £395, with a discounted rate for student and recently graduated composers."
- JSON-LD (in `slot="head"`, same pattern as `recording.astro`): `Service` named "Alma Consort — Composer Recording Day", provider `PerformingGroup` Alma Consort, `areaServed` London, `audience` `{ "@type": "Audience", "audienceType": "Composers" }`, `offers`: one `Offer` per core package at the **Standard** price, `priceCurrency: "GBP"`. Generated from the data module, not hand-written.

### Sections, top to bottom

1. **TitleBlock** — eyebrow "Recording", title "For Composers", pitch: *Hear your choral writing sung by <span class="accent">eight professional voices</span>, then recorded, filmed and mastered by our own team.*

2. **How it works** (`aria-labelledby`) — three numbered points in the `.caps` style from `recording.astro` ("01 · Schedule", "02 · Forces", "03 · Delivery"):
   - **Shared schedule** — We fit your piece into our existing recording days, so you share the cost of singers, venue and production team, and pay a fraction of a private session.
   - **Professional forces** — Eight professional singers, a recording producer and a videographer.
   - **Finished recording** — One piece of up to three minutes: rehearsed, recorded, edited and mastered.

3. **Packages** (`SectionHead` "Packages") — lede: "We record, edit and master one piece of up to three minutes." Price table (see *Price tables*). Below: "Every package includes rehearsal and recording time, a stereo master in WAV and MP3, and a licence to use the recording in your portfolio, competition entries, and funding or academic applications."

4. **Emerging Composer rate** — highlighted panel (white background, claret hairline border, like `.sister-service` on the contact page). Copy:
   - You qualify if you are enrolled on a degree course, or graduated within the past three years. Send evidence with your enquiry.
   - Places at this rate are limited on each recording day.
   - In return we ask two things: credit and tag us when you post the recording, and let us use a short excerpt in our own promotion.

5. **Add-ons** (`SectionHead` "Add-ons") — price table of all add-ons. Footnote: "The last three are charged at the same rate on both tiers, because they use recording time on the day rather than post-production."

6. **The social media feature** — short `h3` + paragraph: we sing choral and sacred repertoire and our strongest posts have reached well beyond that audience; a feature puts your video on our channels with full composer credit and a link you choose. We sell the placement, not a view count. We'll say at enquiry whether we think your piece suits the channel, and if we change our minds after the recording, we refund the fee.

7. **What we need from you** — three short items (reuse the `.step` numbered-list pattern from `recording.astro`, numerals i–iii):
   - **Your score, four weeks ahead** — score and parts if you have them. We'll confirm the piece fits the time available, or tell you what would need to change.
   - **Eight voices** — write for eight voices. Talk to us first if your piece calls for instruments, electronics or extended techniques.
   - **Forty-five minutes per piece** — enough for a well-notated three-minute work of moderate difficulty. Denser writing may need the second-take add-on or a longer slot; we'll say so when we read the score.

8. **EnquiryBand** — title: `Record your <span class="accent">piece</span>`; body: "Tell us about your piece: its length and voicing, the package you're interested in, and whether you're applying for the Emerging rate." Primary: "Enquire about a recording" → `${base}contact/?type=composer`. No secondary link until the PDF is available (then: "Download the price sheet (PDF)").

`OrnamentRule` after section 2 and after section 6; follow house heading pattern and `aria-labelledby` on every section.

## Data: `src/lib/composer-recording.ts`

Single source of truth for all prices. Both tables and the JSON-LD read from it.

```ts
export interface PriceLine {
  label: string;
  detail?: string;
  standard: number;   // GBP, whole pounds; negative = discount
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

export const formatPrice = (n: number): string =>
  n < 0 ? `−£${Math.abs(n)}` : `£${n}`;   // U+2212 minus
```

Order of add-ons matches the PDF so the "last three" footnote stays true. If the order changes, the footnote must change with it.

## Price tables (scoped styles in the page)

- Semantic `<table>` with visually-hidden `<caption>` ("Composer Recording Day packages, standard and emerging composer rates"), `<th scope="col">` for Package / Standard / Emerging, `<th scope="row">` for each label, `detail` rendered as a muted line under the label.
- Editorial styling from tokens only: serif row labels, small-caps sans column headings in `--color-claret`, `--color-border` hairlines between rows, prices right-aligned with `font-variant-numeric: tabular-nums`. Emerging column header gets the accent colour so the discount reads at a glance.
- No brand colours hardcoded; no inline `style=`.
- **375px:** the table must fit without horizontal scroll. Price columns shrink to content (`width: 1%; white-space: nowrap`), label column wraps. Verify explicitly.

## Contact form change: `src/components/ContactForm.astro`

1. Add `<option value="Composer Recording Day">Composer Recording Day</option>` after "Recording Project".
2. In the existing inline script: read `new URLSearchParams(location.search).get('type')`; if it is `composer`, set the select to "Composer Recording Day". Run before the existing `toggle()` call.
3. Add a hint paragraph under the message textarea, hidden by default, shown when the select value is "Composer Recording Day": "Tell us the piece's length and voicing, which package you're interested in, and whether you're applying for the Emerging rate." Toggled in the same `change` handler that already toggles the date field. Linked to the textarea via `aria-describedby` when visible.

No new fields. Web3Forms submission is unchanged. (Locally the form no-ops without `PUBLIC_WEB3FORMS_KEY`; that is expected.)

## Linking in

- **`/recording/`:** a compact band between the Process section and the EnquiryBand: eyebrow-style label "For composers", one line "Have a new choral piece recorded and filmed by eight professional singers, from £275 at the Emerging rate.", link "Composer Recording Day →" to `${base}recording/composers/`. The "from" figure is read from `PACKAGES` (min emerging), not hardcoded.
- **`/work-with-us/`:** `ServiceCard` takes a single link, so no component change. Append to the Recording Sessions description: "Composers can also book a place on one of our Composer Recording Days." The card's link stays on `/recording/`, which now links onward.
- **`public/llms.txt`:** add under Pages, after Recording: `- [Composer Recording Day](https://www.almaconsort.com/recording/composers/): Recording and filming new choral works for composers, with published prices and a discounted Emerging Composer rate.`
- Main nav and `NAV_LINKS`: unchanged.

## Out of scope

- Dates, availability or places-remaining display.
- Online booking or Stripe deposits.
- A recordings/examples strip on this page.
- Booking terms on the page.
- Editing the PDF (owner does this).

## Verification

1. `npm run check && npm run build` pass.
2. `dist/recording/index.html` and `dist/recording/composers/index.html` both exist.
3. Preview: page renders all sections; breadcrumbs read Recording › For Composers; JSON-LD parses.
4. 375px width: no horizontal overflow anywhere on the page (`document.documentElement.scrollWidth <= innerWidth`).
5. `/contact/?type=composer` preselects "Composer Recording Day" and shows the hint; switching to another type hides it; "Event Engagement" still shows the date field.
6. Link from `/recording/` to the new page works, with a trailing slash and the `base` prefix.

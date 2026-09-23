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

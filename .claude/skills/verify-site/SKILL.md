---
name: verify-site
description: Verify website changes end-to-end before committing — typecheck, build, and a per-page-type checklist of known regression spots (Stripe overflow, breadcrumbs, nav, meta). Use after any change to src/ or public/.
---

# Verifying the site

## 1. Always

```bash
npm run check    # astro check — must report 0 errors
npm run build    # must succeed; content schema violations fail here
```

The build writes static HTML to `dist/`, which you can grep directly — often faster and more reliable than browser inspection for meta/JSON-LD checks:

```bash
grep -o '<title>[^<]*' dist/index.html
grep -c 'application/ld+json' dist/events/<slug>/index.html
```

## 2. Visual check

```bash
npm run preview   # serves dist/ on http://localhost:4321
```

Then curl pages or use a browser/screenshot (Playwright with executablePath `/opt/pw-browsers/chromium` is available in remote sessions).

## 3. Known regression spots — check the ones your change touches

- **Support pages (`/support/<tier>/`)**: Stripe buy buttons have overflowed their cards on narrow screens **three separate times**. Check at ~375px viewport width: buttons must stay inside `.pricing-row`. Note: `<stripe-buy-button>` only renders with network access to js.stripe.com; locally verify the layout container, not the button internals. Also confirm the price/period text matches the Stripe button's own label (e.g. "£500 / year", not a monthly equivalent).
- **Event pages (`/events/<slug>/`)**: exactly ONE breadcrumb trail (the global one from BaseLayout). Title/date/venue/ticket link correct; `MusicEvent` JSON-LD present.
- **Header nav**: links come from `NAV_LINKS` in `src/lib/constants.ts`. At narrow widths the header JS-measures and switches to hamburger mode — resize across ~700–1100px and confirm no overlap between brand and nav, and that the hamburger opens/closes.
- **Homepage**: hero video renders (lite-youtube embed), upcoming-concerts section shows either future events or the styled `EmptyState` (empty is correct when no future-dated events exist — do not "fix" it).
- **Footer**: nav links + 4 social icons render; on the homepage, JSON-LD `sameAs` should list the same URLs as the footer icons (both derive from `SOCIAL_LINKS`).
- **Any new/renamed route**: appears in `dist/sitemap-index.xml` / `sitemap-0.xml`; internal links to it end with `/`.
- **Contact form**: locally `PUBLIC_WEB3FORMS_KEY` is unset so the hidden access-key input is empty and submission won't work — expected, not a bug. Just verify the form renders and the conditional date field toggles.

## 4. After deleting anything

```bash
grep -rn "<DeletedName>" src/ public/ astro.config.mjs
```

Zero hits required.

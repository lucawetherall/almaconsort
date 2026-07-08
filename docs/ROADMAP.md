# Website improvement roadmap

Prioritized backlog from a full site audit (2026-07-08). Each item is written as an executable brief so an AI agent (or human) can pick it up cold. **Owner** items need a decision or content from Luca/Izzy; **Agent** items can be executed directly. Delete items when done; add new ones in the same format.

Already fixed in the audit PR (for context): dead components removed (BioCard/Divider/EventCard), 535 KB unused `logo-transparent.png` deleted, duplicate breadcrumb on event pages removed, annual Patron pricing labels corrected, theme-color/webmanifest mismatch aligned, nav + social links centralized in `src/lib/constants.ts`, `npm run check` added.

---

## High priority

### 1. Publish upcoming events — the site currently reads as inactive [Owner]
- **Problem**: The only event (`src/content/events/valentines-day-opera.md`, 2026-02-14) is in the past. The homepage and `/events/` show "next concert hasn't been announced" empty states, and the MusicEvent structured data on `/events/` is suppressed entirely.
- **Fix**: Add future-dated event files as soon as concerts are confirmed (see the `add-content` skill for the template). No code change needed — the daily rebuild picks them up.
- **Done when**: Homepage shows at least one upcoming concert; `/events/` emits MusicEvent JSON-LD.

### 2. Decide on analytics [Owner decision, then Agent]
- **Problem**: `src/layouts/BaseLayout.astro` (~line 106) has the GA4 snippet commented out with placeholder `G-XXXXXXXXXX`. No analytics run anywhere, so there's no data on which pages convert (recording enquiries, donations).
- **Fix**: Either supply a real GA4 measurement ID (agent then uncomments and wires it), choose a lighter-weight alternative (e.g. Plausible/GoatCounter — note the no-new-runtime-deps constraint applies to npm, not third-party scripts, but keep it minimal), or delete the block deliberately.
- **Done when**: The commented block is gone, replaced by working analytics or nothing.

## Medium priority

### 3. Self-host fonts and the YouTube embed helper [Agent]
- **Problem**: Render-blocking cross-origin requests: Google Fonts CSS in `BaseLayout.astro` head, and lite-youtube-embed CSS+JS from cdn.jsdelivr.net in `src/pages/index.astro` head. External availability/privacy dependency on every page load.
- **Fix**: Self-host the two font families (woff2 subsets in `public/fonts/` + `@font-face` in `global.css` with `font-display: swap`), and vendor lite-youtube-embed locally (devDependency or checked-in copy — runtime-dep constraint is about client frameworks, use judgement and note the decision in CLAUDE.md).
- **Done when**: No requests to fonts.googleapis.com/fonts.gstatic.com/cdn.jsdelivr.net in built pages; visual appearance unchanged; `npm run build` clean.
- **Effort**: ~half a day. Test font fallbacks carefully.

### 4. Stop loading the Zoho newsletter script on every page [Agent]
- **Problem**: `Newsletter.astro` is embedded site-wide via BaseLayout, so Zoho's `optin.min.js` + ~30 hidden inputs ship on all routes.
- **Fix**: Lazy-load the script when the newsletter section scrolls into view (IntersectionObserver, vanilla JS), or render the form static and load the script on first interaction.
- **Done when**: No Zoho request on initial load of any page; signup still works (verify on the live site after deploy).

### 5. Build-time assertion for the contact-form key [Agent]
- **Problem**: `ContactForm.astro` renders `access_key={import.meta.env.PUBLIC_WEB3FORMS_KEY}`. If the GitHub secret is ever lost, production builds silently ship a broken contact form.
- **Fix**: In the CI build only (env `CI=true`), fail or loudly warn when the key is empty — e.g. a check in `astro.config.mjs` or a prebuild script. Local builds without the key must keep working.
- **Done when**: A CI build without the secret fails with a clear message; local `npm run build` unaffected.

### 6. Deduplicate the VideoObject JSON-LD [Agent]
- **Problem**: `src/pages/index.astro` and `src/pages/recording.astro` each hardcode the same "O Magnum Mysterium" VideoObject, including `uploadDate: "2025-12-01"` — duplication invites divergence, and the date is unverified.
- **Fix**: Move the hero video metadata (id, title, description, uploadDate) to `src/lib/constants.ts`; both pages build their JSON-LD from it. Verify the real upload date on the YouTube channel.
- **Done when**: One source of truth; both pages emit identical, correct VideoObject data.

## Low priority / polish

### 7. Support tier card imagery [Owner]
- No tier in `src/content/support-tiers/` sets `cardImage`, so `/support/` shows three flat colour blocks (`SupportTierCard.astro`). Supply three images (4:3) or an agent should remove the media block until imagery exists.

### 8. Evergreen the Scholars page copy [Agent]
- `src/pages/scholars.astro` names specific past concerts ("Valentine's Day Opera Gala in February 2026") as showcase examples. Reword to be evergreen, or pull recent events from the events collection at build time.

### 9. Component consolidation audit [Agent]
- `ConcertCard` vs `ConcertTile`, `RecordingTile` vs `FeaturedRecordings` overlap. Verify actual usage, merge or document the intended distinction in the build-components-pages skill.

### 10. Legacy field/token cleanup [Agent]
- `events` schema keeps a legacy `image` field ("kept for compatibility", still used for OG images in `events/[slug].astro`) alongside the newer `photo`; `global.css` lines ~52-55 keep legacy `--shadow-card` aliases. Migrate and remove when convenient.

### 11. Homepage visible heading — decided, no action
- The homepage `<h1>` is `visually-hidden` by design (video hero leads). Documented here so future audits don't re-flag it. Revisit only if the hero changes.

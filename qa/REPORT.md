# QA report — Unnati Montessori website v1

Build date: 22 October 2026 · Astro 7.4.2 · tested against `astro preview` (production build) in Chromium 156.

## Automated results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ 0 errors (17 routes + robots.txt + sitemap) |
| `npx astro check` | ✅ 0 errors, 0 warnings (75 files) |
| Playwright, all suites | ✅ **215 / 215 passed** |
| · responsive | ✅ 154 / 154: 16 pages × 9 viewports (+ games at 800×360, 915×412); no horizontal scroll; tap targets ≥ 48 px (games ≥ 64 px from 360 px wide) |
| · a11y (axe-core, WCAG 2.2 AA + best practice) | ✅ 32 / 32: every page at 390 and 1280 wide, 0 serious / critical |
| · games | ✅ 20 / 20: each game completed by mouse drag, by tap on a touch phone, and by keyboard only; wrong moves glide back; loose cylinder ≠ complete; spindle "too many" stays untied; TTS never asked to say a single letter |
| · enquiry | ✅ 6 / 6: invalid mobile error + focus; exact `wa.me/917550022403` URL; success state; touch hand-off via `location.href`; every WhatsApp link says "WhatsApp"; every phone is `tel:` |
| · motion (reduced motion) | ✅ 3 / 3: `document.getAnimations().length === 0` after shelf, Ankur, flip, toggle, wheel, a game move/refusal/completion, tracing |

Screenshots: `qa/screenshots/{page}-{w}x{h}.png` (154 files). Raw test output: `qa/test-results.json`.

## Lighthouse (mobile, simulated throttling) — `qa/lighthouse/*.report.html`

| Page | Perf | A11y | Best Pr. | SEO | LCP | CLS | TBT | Transfer |
|------|-----:|-----:|-----:|----:|----:|----:|----:|-----:|
| `/` | 97 | 100 | 100 | 100 | 2.3 s | 0 | 0 ms | 175 KB |
| `/approach` | 100 | 100 | 100 | 100 | 1.8 s | 0 | 0 ms | 118 KB |
| `/admissions` | 100 | 100 | 100 | 100 | 1.7 s | 0 | 0 ms | 110 KB |
| `/play` | 100 | 100 | 100 | 100 | 1.7 s | 0 | 0 ms | 103 KB |
| `/play/knobbed-cylinders` | 100 | 100 | 100 | 100 | 1.7 s | 0 | 0 ms | 97 KB |
| `/day-care` (extra) | 100 | 100 | 100 | 100 | 1.8 s | 0 | 0 ms | 112 KB |

Budget: Perf ≥ 90, others ≥ 95, LCP < 2.5 s, CLS < 0.05, TBT < 200 ms, home ≤ 900 KB → **all met**.

## JavaScript per page (gzipped, `node scripts/js-budget.mjs`)

Content pages 1.2–4.8 KB (budget 35 KB) · games 6.2–7.0 KB including the shared engine (budget 60 KB).
Zero third-party requests at runtime: no font CDNs, analytics, map embeds or widgets.

## SEO

Unique titles (≤ 59 chars) and descriptions (≤ 155 chars) on every page, one H1 each, canonical URLs, `sitemap-index.xml`,
`robots.txt`, Open Graph + Twitter tags with `/og/default.png` (1200×630), `Preschool` JSON-LD on the home page.

## Visual self-review (5.2)

Reviewed 360×800 and 1440×900 for every page and game, plus completion states. Fixed during review:
shelf chips all showing at once; game board overflowing on desktop; ghost hit-box in "Show me"; stray dot on empty
letter trails; map labels colliding at phone width; phone-landscape game bar eating board height (now a side rail);
enquiry button moving under the pointer when a blur error appeared; low-contrast planes headers; a spindle bundle that could still tie after one too many.

## Manual checks for you (5.3)

1. **Android phone:** open the home page, tap every shelf item, send a test enquiry. WhatsApp should open with the message ready for **+91 75500 22403**.
2. **Play all five games with a small finger:** the page should not scroll or zoom on double-tap, and speech should be audible.
3. **iPhone Safari:** speech and sound should work after the first tap in a game (iOS needs that first tap).
4. **Turn on "Remove animations" (Android) / "Reduce Motion" (iOS):** the site should be calm and fully usable.
5. **Confirm +91 75500 22403 and +91 90035 84303 both have WhatsApp.**
6. **Extended Day Care:** read `/day-care` and confirm every line is true for Unnati. Then add the hours in `src/config/site.ts` → `dayCare.hours`.

## Known gaps

- **SITE_URL** isn't set, so links use `https://unnati-montessori.netlify.app`. Set the real domain in Netlify and rebuild.
- **Enquiry webhook** isn't configured, so enquiries go to WhatsApp only.
- **Extended Day Care hours** are pending; the site says "Call or WhatsApp us for timings".
- **No school photos yet**, so the site uses illustrations only (by design until real photos exist).
- **No recorded phonetic sounds** (`public/audio/sounds/*.mp3`). Sandpaper Letters speaks only the keyword until they're added.
- **Automated tests ran in Chromium only.** Safari and Firefox need the manual checks above. Speech was tested with a stub; real voices vary by device (en-IN → en-GB → any English).
- **Graceful fallbacks:** page cross-fades (`@view-transition`) and smooth FAQ opening (`::details-content`) only run in browsers that support them. Others get instant changes.
- **Lighthouse** was measured on a local preview, so real-world numbers on Netlify's CDN will differ slightly.

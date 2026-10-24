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

---

# Add-on: Ankur guide + page transitions (23 October 2026)

Before starting, all 215 v1 tests passed, so no test was already failing. Firefox and WebKit were installed for Playwright.

## Automated results

| Check | Result |
|-------|--------|
| `npm run build` / `astro check` | ✅ 0 errors |
| **transitions.spec** | ✅ **20 / 20** + 1 skipped: Chromium 7/7, Firefox 6/6 (the phone test is skipped because Firefox has no touch emulation), WebKit 7/7 |
| **mascot.spec** (Chromium) | ✅ **9 / 9** |
| **v1 regression** (responsive, a11y, games, enquiry, motion) | ✅ **215 / 215** |
| Total | ✅ **244 passed**, 1 skipped, 0 failed |

What the new suites cover:

- **transitions.spec:**
  - A nav-only tour of 8 pages checking URL, H1, title, focus on `#main`, no console errors, and that the header is the same DOM node.
  - Shelf, toggle, flip card, wheel arrow keys, planes tabs, map, FAQ and the exact `wa.me` URL, all reached by links rather than a fresh load.
  - Two whole games played by tap via links.
  - Scroll restored on history back; `/approach#compare` lands on and focuses its section.
  - `/play` → game → back ×10 leaves exactly 1 speech call per action and 1 shelf handler per tap.
  - Zero animations under reduced motion.
  - Unique view-transition names on every page.
- **mascot.spec:**
  - The guide is shown on the right pages and hidden on the others.
  - At most one Ankur on screen at any of 10 scroll positions on every page.
  - The guide never overlaps the action bar, the Enquire button or the submit button, checked at 4 viewports.
  - The bubble opens by tap and Enter, closes by Esc (focus returns) and by tapping outside; tips and chips match `site.ts`.
  - Hide → reload → leaf tab → Ankur returns.
  - Form fields hide him.
  - The greeting appears once per session.
  - axe finds 0 serious or critical issues on every page with the bubble open.

## Lighthouse (mobile) — `qa/lighthouse/*.report.html`

| Page | Perf | A11y | BP | SEO | LCP | CLS |
|------|-----:|-----:|---:|----:|----:|----:|
| `/` | 96 | 100 | 100 | 100 | 2.4 s | 0 |
| `/approach` | 99 | 100 | 100 | 100 | 2.1 s | 0 |
| `/admissions` | 99 | 100 | 100 | 100 | 2.1 s | 0 |
| `/play` | 99 | 100 | 100 | 100 | 2.1 s | 0 |
| `/play/knobbed-cylinders` | 100 | 100 | 100 | 100 | 1.8 s | 0 |
| `/day-care` (extra) | 99 | 100 | 100 | 100 | 2.1 s | 0 |

JavaScript, gzipped and including the router: content pages 11.4–13.4 KB (budget 45 KB), games 15.3–16.2 KB (budget 60 KB). The guide script is 2.4 KB (budget 6 KB). CLS stays 0 because the dock is `position: fixed`.

## Visual review (5.2)

Filmstrips are in `qa/transitions/` (frames at about 0, 120, 240 and 400 ms, plus `*-sheet.png` contact sheets). Dock and bubble screenshots are in `qa/screenshots/ankur-*.png`.

- **Home → Approach (slide):** the old content drifts left and fades, then the new content arrives from the right. No white flash. The header stays put. If you navigate from far down a page, the new page starts at the top, so the announcement bar reappears above the header.
- **/play → Knobbed Cylinders:** the sprout reveal grows from the tapped card. Its picture morphs into the game's top-bar icon, and the other cards' pictures fade out within about 240 ms.
- **History back:** the page slides in and the scroll position is restored.
- **Ankur's states:** travel, land, point, hide and return checked; he looks friendly in each.
- **Fixed during review:** the sprout reveal never played, because Astro fires `astro:page-load` before the transition animates and the reveal state was being cleared there. It's now cleared when the transition finishes.

## Manual checks for you (add-on 5.3)

1. **Android Chrome:** tap through every menu link. Pages should slide smoothly and the header should stay still. The shelf, toggle, cards and form should all still work after navigating.
2. **Little Hands Corner:** open it from the menu; the page should grow open from where you tapped. Open a game card; its picture should fly into the game's top bar.
3. **iPhone Safari:** repeat checks 1 and 2, and confirm Ankur stays clear of the Call/WhatsApp bar. Leaving a game (Activities / All activities) does a normal page load on Safari; see the known gaps.
4. **Reduce motion:** turn on "Remove animations" (Android) or "Reduce Motion" (iOS). Pages should change instantly and Ankur should stay still.
5. **Hide Ankur:** hide him, close the browser and reopen the site. He should stay hidden until you tap the leaf tab.
6. **Day Care tip:** read Ankur's tip on `/day-care` ("Extended Day Care welcomes children aged 1–6. Ask us about timings."). It's new copy, not from the approved list.

## Known gaps (add-on)

- **WebKit crash workaround:** Playwright's WebKit crashes when a view transition runs out of the full-screen game shell into a site page. In Safari and other WebKit browsers, a game's "Activities" and "All activities" links therefore do a normal page load, with no slide. Everything else animates, and back/forward from a game still animates. Re-test on a real iPhone; if real Safari is fine, the workaround can be removed in `src/games/engine/shell.ts`.
- **No-transition fallback:** browsers without view transitions get Astro's fallback animation (slide only, no sprout reveal or morph).
- **Phone test in Firefox:** skipped, because Playwright can't emulate touch in Firefox.

---

# Ankur keeps growing (23 October 2026)

- `tests/growth.spec.ts` ✅ 3 / 3:
  - Interactions grow him, and the stage is shared by every Ankur on the page.
  - Growth survives a reload; revisiting a page adds nothing; new pages and FAQs add points.
  - The screen-reader message is announced.
  - A game completion adds 3, and he reaches and stops at the second flower.
  - Under reduced motion, growing plays no animation.
- The full suite passes: **247**, plus 1 skipped (Firefox touch).
- **Manual check:** on a phone, tap around the home page and play a game. Ankur should gain leaves, then a bud, then flowers. His growth should still be there after closing and reopening the browser.

---

# Round 2 changes (24 October 2026)

Brief: `CONSULTANCY_Unnati_Website_Changes_Prompt_v2.md`. Phases 1–7 were each committed separately. Decisions 76–98 are in `DECISIONS.md`.

## Automated results (full suite: 321 passed, 1 skipped, 0 failed)

| Suite | Result | What it covers |
|---|---|---|
| `round2-content.spec.ts` | ✅ 44 / 44 | No removed copy or code in `src/` and `dist/`: the old number, House for Children, `/play`, Little Hands, Did you know, Four Planes, Adolescence, Maturity, Reasoning Mind, speechSynthesis, AudioContext, `unnati:sound`. Plot No. 5 and +91 75500 22403 in every footer; Plot No. 5 on /contact, in the Find-us panel and in the JSON-LD. Every `tel:` and `wa.me` link uses 917550022403. `firstPlaneTitle` change → rebuild → heading updates → restored. Green-underline scan on all 19 pages at 360 and 1440 px (rest, nav hover, 40 keyboard focus stops). |
| `at-home.spec.ts` | ✅ 20 / 20 | Filters (Sensorial → 1, 4+ → 8, 2½+ → 3 named), URL state, live region, empty state, no-JS view; all 8 activity pages; Watch how plays once, then nothing lingers; reduced motion makes 0 animations; step mode (Next/Back, arrows, swipe, Esc, focus return, 22 px+ text, 48 px+ buttons); tried + counter + undo; material ticks per activity; share fallback; print fits one A4 page; explorer by tap and keyboard, 3 ticks → 3 leaves, persisted; shelf and area links; `/play` redirects. |
| Regression | ✅ 257 / 258 (1 skipped) | responsive (19 pages × 9 viewports: no sideways scroll, 48 px targets), axe on every page at two widths plus step mode open and an explorer card open (0 serious/critical), enquiry, growth, motion, guide/mascot, transitions in Chromium, Firefox and WebKit. The skip is the phone test in Firefox (no touch emulation). |

The green-underline scan was checked against a page with an injected green underline and green focus ring, and it fails as it should.

## Lighthouse (mobile): `qa/lighthouse/*.report.html`

| Page | Perf | A11y | BP | SEO | LCP | CLS |
|------|-----:|-----:|---:|----:|----:|----:|
| `/` | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| `/approach` | 99 | 100 | 100 | 100 | 2.1 s | 0 |
| `/admissions` | 99 | 100 | 100 | 100 | 2.1 s | 0 |
| `/at-home` | 97 | 100 | 100 | 100 | 2.4 s | 0.016 |
| `/at-home/pouring-water` | 97 | 100 | 100 | 100 | 2.4 s | 0.009 |

**JavaScript (gzipped):** `/at-home` 13.2 KB and each activity page 15.3 KB (budget 35 KB). Other pages are 12.0–14.0 KB. **Scene SVGs** are inline, at 2.5–4.7 KB each (budget 25 KB).

## Visual review

- Screenshots for every page at every viewport are in `qa/screenshots/` (the game screenshots were deleted). Navigation filmstrips, including the card → scene morph and the sprout reveal into /at-home, are in `qa/transitions/`.
- All 8 "Watch how" presentations were checked frame by frame (start, two midpoints, finished state).
- Fixed during QA:
  - Hotspot cards reopened when Close returned focus to their leaf.
  - On phones, the 48 px leaves overlapped, so the room now scrolls sideways inside its own frame.
  - JS-revealed controls (filters, Watch how, Step-by-step) caused layout shift; they're now hidden for no-JS visitors with `<noscript>` instead.
  - A few new controls were 44 px; they're now 48 px.

## Manual checks for you

1. On a phone, open an activity, tap **Step-by-step mode** and prop the phone up. The screen should stay on, and swiping should move between steps.
2. Tap **Share** on a phone. The system share sheet should open; on a laptop, WhatsApp opens with the text instead.
3. **Print** an activity (or Save as PDF). It should be one A4 page with the logo, steps and address.
4. Read the 8 activities with a teacher's eye, especially the safety notes.
5. Review the Day Care guide tip (unapproved copy, decision 97).
6. After deploying, open `/play` and check it lands on Montessori at Home.

## Known gaps

- The scene illustrations are drawn simply (flat, mitten-style hands). Your own recorded clips (`brand-assets/at-home/{slug}.mp4`, README section 5) will replace them whenever you add them.
- No `.mp4` clips are included yet, so the video path is untested with a real clip. It only renders when a file exists.
- The WebKit workaround from the add-on is gone along with the games.

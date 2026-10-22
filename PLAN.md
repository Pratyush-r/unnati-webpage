# Unnati Montessori website — build plan (Phase 0)

Brief: `CONSULTANCY Unnati Website ClaudeCode Prompt v1` (v1), plus a change from the owner (22 Oct 2026):
**Extended Day Care** gets its own page (`/day-care`), ages 1–6, hours to be given later,
only "rest / nap time" and "daily updates to parents" may be claimed.

## Prerequisites (all pass)
| # | Check | Result |
|---|-------|--------|
| 1 | Node ≥ 22, npm | Node 24.12, npm 11.6 |
| 2 | Logos | `brand-assets/unnati-logo-wide.jpg`, `unnati-logo-square.jpg` |
| 3 | Posters | 22 in `brand-assets/reference/` (style reference only, never embedded) |
| 4 | Photos | none → illustrations only, no "Inside Unnati" strip |
| 5 | SITE_URL | not set → `https://unnati-montessori.netlify.app` (flag in report) |
| 6 | Enquiry webhook | not set → WhatsApp only |
| 7 | Playwright Chromium | installed |

## File tree
```
src/
  config/site.ts            single source of truth for facts
  content/copy.ts           Section 6 copy as data (+ Day Care copy)
  styles/tokens.css global.css motion.css
  lib/                      wa.ts, storage.ts, reveal.ts, press.ts
  layouts/BaseLayout.astro  head/SEO, header, footer, sticky bar, announcement
  layouts/GameLayout.astro  full-viewport game shell
  components/
    Header, Footer, StickyBar, AnnouncementBar, Icon, VineDivider, SectionHead
    Ankur.astro + ankur.ts
    PreparedShelf, ProgrammeCards, AreaCards, CompareToggle, FlipCards,
    PrinciplesWheel, Planes, FindUsMap, Journey, Faq, ConsultancyVsFranchise,
    EnquiryForm, illustrations/*
  games/engine/             interact.ts, audio.ts, speech.ts, announce.ts, showme.ts, board.ts, shell.ts
  games/                    set-the-table.ts, knobbed-cylinders.ts, sandpaper-letters.ts, spindle-box.ts, land-air-water.ts
  pages/                    index, about, approach, admissions, day-care, play/*, teach, consultancy, contact, privacy, 404
scripts/                    process-logos.py, make-og.mjs, sounds-manifest.mjs
tests/                      responsive, a11y, games, enquiry, motion
public/brand, public/fonts, public/og
```

## Risks
- Speech synthesis voices vary by device → silent no-op fallback; tested by stubbing.
- Game drag precision on small phones → tap-to-place is first-class; snap radius 70 units.
- JS budget (35 KB content / 60 KB game) → vanilla TS, no libs, per-page scripts.
- Lighthouse on Windows headless → run against `astro preview` with Playwright Chromium.
- Nav width at 1024 px with the extra Day Care link → shorter label "Day Care" in nav.

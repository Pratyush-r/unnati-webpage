# Decisions log

One line per judgement call made during the build.

1. **Brand assets:** the wide logo (1600×800) and square logo (1254×1254) shared in chat became `brand-assets/unnati-logo-wide.jpg` and `unnati-logo-square.jpg`; the 22 posters went to `brand-assets/reference/` as style reference only (never embedded).
2. **Extended Day Care (owner request, 22 Oct 2026):** added a dedicated `/day-care` page. The owner confirmed the name "Extended Day Care", ages 1–6, hours to come later, and only two facilities to claim: rest/nap time and daily updates to parents.
3. **Day Care page structure** follows common patterns from other day-care sites (daily rhythm, care routines as practical life, rest, parent updates). Meals and outdoor play are left out because they weren't confirmed.
4. **Day Care hours** live in `site.dayCare.hours`. While empty, the site says "Call or WhatsApp us for timings."
5. **Nav label** is the short "Day Care" so the desktop nav fits at 1024 px; the page and cards use "Extended Day Care".
6. **`site.ts`** gained `primary.ages` and `dayCare { name, ages, hours }` so no age or timing is typed anywhere else.
7. **Announcement** kept as the brief's text ("Admissions open for ages 2½–6 · Join any time of the year"). Adding Day Care made it wrap to three lines on phones.
8. **Enquiry age options** gained "Under 1" and "1–2½" (Day Care takes age 1); the programme checkbox reads "Extended Day Care".
9. **WhatsApp enquiry message:** an empty age prints "Not given" and no programmes prints "Not sure yet", so the template never has blank lines.
10. **Parent FAQ** Q1 and Q3 add one sentence about Extended Day Care ages, plus a link to its page.
11. **Home meta description** uses the brief's exact text, which says "Day Care" (155-character limit).
12. **Journey steps:** the brief gives titles only; each got a one-line description drawn from the founder note (no dates).
13. **Ankur's parts** use classes (`.ankur-pot` etc.), not ids, because Ankur can appear twice on one page (shelf + enquiry form).
14. **Ankur on the home shelf** has blink on; in enquiry forms and games blink is off, so only one character blinks per page.
15. **SITE_URL** not set → `https://unnati-montessori.netlify.app` (flagged in the report).
16. **Webhook** not set → enquiries go to WhatsApp only; the privacy note's webhook line is hidden automatically.
17. **Reveal animation** is added by JS only to elements that start below the fold, so above-the-fold content never animates and no-JS visitors see everything.
18. **Find-us map:** road names sit inside the road bands, and the Unnati label sits above the pin, to avoid clashes on small screens.
19. **Principles wheel** uses the radiogroup pattern (roving tabindex, arrow keys); the centre panel moves below the wheel under 768 px.
20. **Four planes table:** only column headers are focusable (4 tab stops, not 32); focusing one highlights its column.
21. **Approach page** adds one framing line for the planes ("four planes of about six years each"), a standard Montessori description.
22. **Consultancy FAQ intro** reads "We say yes to most of them." The poster said "YES to all", but one question (setup duration) isn't a yes/no.
23. **Teach page Caveat accent** is "Follow the child." (one accent per page).
24. **Devanagari "उन्नति"** uses the visitor's system Devanagari font, so no extra font download.
25. **Game shell:** the spoken intro plays on the first touch or key press, because browsers block speech before a user gesture. Nothing plays by itself.
26. **Phone landscape (height ≤ 500 px):** the game top bar becomes a slim side rail so the board keeps its height.
27. **Knobbed Cylinders** uses a top-down view. Visual diameters are 110–230 board units; each cylinder's touch area is ≥ 142 units (≥ 64 CSS px at 360 px wide), because five graded holes ≥ 142 units each don't fit the portrait board.
28. **Knobbed Cylinders loose fit:** a loose cylinder sits off-centre in its hole (the gap ring shows) and is turned 4°.
29. **Spindle Box:** spindles are identical, so the basket and the box are each one big tap target (pick from basket → tap box). Drag works too; keyboard uses Enter on basket/box.
30. **Spindle Box** uses an elevated front view of one compartment; tied bundles gather into a final row of five with their numerals.
31. **Sandpaper Letters keyboard play:** with the letter focused, Space/Enter traces ~12% of the active stroke per press, and taps the dot on "i".
32. **Sandpaper Letters taps:** a tap near any of the next four checkpoints advances, so the letter can be traced by tapping as well as dragging.
33. **Sandpaper keyword** is spoken at rate 0.7 ("slowly"); a recorded phonetic sound plays first when `public/audio/sounds/{letter}.mp3` exists (build-time manifest).
34. **Land, Air & Water:** each tray holds up to three cards in slots; trays never become "occupied" in the engine.
35. **Kattumaram** is drawn as a log raft with a sail and is spoken as "fishing boat"; its accessible label is "kattumaram fishing boat".
36. **Insect card** is a ladybird, as the brief specifies.
37. **Game pieces** are SVG `<g role="button">` with names; trays/holes become focusable only while a piece is held, so Tab cycles targets.
38. **Show me** auto-plays once per game per browser (`unnati:showme:{slug}`), then on demand.
39. **Fonts** are copied from Fontsource into `/public/fonts` (Latin, variable wght), so the two main files can be preloaded with stable URLs.
40. **OG image** is generated by `scripts/make-og.mjs` (Playwright) from the transparent wide logo.
41. **Footer** quick links include Extended Day Care; both numbers are labelled as the brief specifies.
42. **Consultancy page** sets the header sheet and sticky bar to the consultancy number.

## Ankur guide + page transitions (add-on v1, 23 Oct 2026)

43. **Router:** Astro 7.4.2's `ClientRouter` (from `astro:transitions`) matches the brief's API, so it was used as written: `<ClientRouter fallback="animate" />` in both layouts. The CSS `@view-transition` rule is removed.
44. **Sprout state across the swap:** the router replaces every `<html>` attribute on swap, so the sprout state (`data-vt`, `--vt-*`) is copied onto `event.newDocument` in `astro:before-swap`.
45. **When `data-vt` is cleared:** it's removed when the view transition finishes (`viewTransition.finished`), not on `astro:page-load`. In Astro 7, page-load fires before the transition animates, so clearing it there cancelled the reveal.
46. **Commits:** phases 1–4 were committed together because the router, the script migration and the guide depend on each other; QA was committed separately.
47. **Persisted chrome on every page:** header, footer, action bar and announcement are rendered on every site page (bars hidden on Little Hands Corner), so persistence holds. Route-dependent parts (`aria-current`, the Enquire target, the Call/WhatsApp number) refresh on `astro:after-swap` from `site.ts`, via `src/scripts/route.ts`.
48. **`initOnce` helper (`lifecycle.ts`):** each persisted element is initialised once. If a game page (which has no header) is visited, the fresh header that arrives afterwards is initialised then.
49. **Game lifecycle:** game modules stay loaded across navigations, so a game starts only when its `[data-game="slug"]` page is on screen. Cleanup aborts listeners, disconnects the ResizeObserver, releases drags, cancels speech and suspends the AudioContext.
50. **Still header:** the header is its own view-transition layer (`site-header`) with no animation, so it stays still. The root doesn't cross-fade; only `<main>` slides.
51. **One style per navigation:** the sprout reveal removes `<main>`'s transition name for that navigation, so only one style plays. Card morphs still run alongside.
52. **Morph targets:** a 44 px material icon in the game top bar (`game-{slug}`) is the morph target for the `/play` cards and the home and `/approach` area icons. Programme icons morph between home and `/admissions` (`programme-{id}`).
53. **WebKit workaround:** Playwright's WebKit build crashes when running a view transition out of the full-screen game shell into a site page. In Apple-vendor browsers, a game's outgoing links (Activities, All activities) therefore do a full page load. Back/forward and all other navigations still animate (see the known gaps in `qa/REPORT.md`).
54. **Day Care guide tip:** the guide also shows on `/day-care` (the owner-added page) with a tip built only from confirmed facts. This copy isn't in the approved list and needs review.
55. **Admissions tip:** its WhatsApp chip uses the general school enquiry message as the "programme enquiry message".
56. **Dock and tab sizes:** the dock button is 64 px (mobile) or 88 px (desktop). The leaf tab is 48×48 px (the brief says 40 px) to meet the 48 px tap-target rule.
57. **Yielding to other Ankurs:** the guide uses an IntersectionObserver plus a visibility check. The form's success Ankur dispatches `unnati:ankurs` so the guide steps aside at once.
58. **v1 form peek retired:** the in-form peek and its `unnati:peek` sessionStorage key are gone. The form's own Ankur is hidden until the success state.
59. **Greeting:** stored in sessionStorage `unnati:ankur-greeted`. If he can't appear on the session's first page (the home shelf Ankur is in view), the greeting waits for his first appearance.
60. **Mobile menu:** the header dispatches `unnati:menu`, and the guide hides while the menu sheet is open.
61. **Keeping home LCP under 2.5 s:** with the router added, all stylesheets are inlined (`inlineStylesheets: 'always'`) and Caveat is subset to ASCII plus curly quotes (51 → 40 KB, `scripts/subset-caveat.py`).
62. **Browser coverage:** Chromium runs every suite; Firefox and WebKit run `transitions.spec.ts`. Firefox has no touch emulation in Playwright, so the phone test is skipped there.
63. **Scroll-restore test:** clicks the sticky header link with `element.click()`. Playwright's auto-scroll would otherwise move the page before the router records the position, which looked like a scroll-restoration bug.
64. **No-transition fallback:** browsers without view transitions get Astro's `fallback="animate"` (page slide, no sprout reveal).

## Ankur keeps growing (owner request, 23 Oct 2026)

65. **Growth stages:** six stages: sprout → leaf (lower left) → leaf (right) → bud → marigold flower → small pink second flower. All Ankurs on the site share one stage, because he's one character.
66. **Points:** ordinary interactions count 1 each (shelf materials, tapping Ankur, comparison toggle, flip cards, principles wheel, planes tabs, map, FAQ or trade-offs opened, opening the guide's bubble). A page's first-ever visit counts 1. Finishing a game or sending an enquiry counts 3. Stages need 0 / 3 / 7 / 12 / 18 / 26 points (`STAGES` in `src/scripts/growth.ts`).
67. **Storage:** growth is stored in localStorage (`unnati:ankur-growth`, `unnati:pages-seen`). It stays on the device and nothing is sent anywhere, and the privacy note already covers small on-device settings.
68. **Growth animation:** the new part pops in (700 ms) and he nods, but only for an Ankur on screen, and always in answer to what the visitor just did. Reduced motion shows the part instantly. Screen readers hear a polite message ("Ankur grew a new leaf.").
69. **Placement:** growth parts sit behind or above the existing leaves, so the game's own "grow" leaf, wave and point still work. The flowers grow upwards into space the dock and shelf already leave free.

## Hand-made look (owner request, 23 Oct 2026)

70. **Direction:** "a Montessori classroom notice board". Faint paper grain, wobbly torn-paper edges between coloured sections, washi tape, pencil underlines (`.scribble`) and a hand-drawn circle around the status chip, pencil doodles in the margins, and the enquiry card on lined notebook paper. All of it lives in `src/styles/handmade.css`, `Doodle.astro` and `PhotoStrip.astro`.
71. **Less symmetrical:** cards sit at slight, varied angles (`.scatter`) and straighten under the pointer. Rows are staggered (`.stagger`). Programme cards have uneven widths and heights. Home area cards are laid out three over two, like the shelf. Some section heads are offset. The founder quote is a tilted, taped note. On phones the cards stay straight, for easy reading.
72. **Labels removed:** the small all-caps labels above section and page headings are gone (a template tell), and so are the "Area 1–5" labels. The two hero labels the brief specifies (home and consultancy) stay. About's Mission and Vision now have visible headings.
73. **Real photos:** photos placed in `brand-assets/photos/` become taped polaroids on the home and About pages (max 6), captioned and alt-texted from the file name. With no photos, nothing renders; no stock or AI imagery is ever used.
74. **Handwriting font:** Caveat stays at one line per page, as the brief asks. The hand-made feel comes from drawn marks rather than more handwriting.
75. **QA timing:** headless Chromium delivers scroll observers only after start-up settles, so the screenshot helper and the responsive test now wait 1.5 s before scrolling. Earlier full-page QA screenshots could show unrevealed sections; this doesn't affect real visitors.

## Round 2 changes (owner brief v2, 24 Oct 2026)

76. **Day Care stays in the nav.** The brief's nav line (About · Our Approach · Admissions · At Home · For Educators · Contact) leaves out Day Care, but that page is live and owner-requested, so it stays between Admissions and At Home.
77. **Brown replaces green for every line.** Body links underline in brown at 40%. The active nav item is a blush pill, hover is brown text, and focus rings are a 3 px brown outline site-wide (including the wheel, map, guide and form checkboxes). The navigation progress bar is brown too. A Playwright scan checks every page at 360 and 1440 px, at rest, on nav hover and across 40 keyboard focus stops.
78. **Scribbles and vine dividers removed.** The pencil underlines (`.scribble`) and the vine dividers drew green or green-adjacent lines under headings, so they went with change 7. The hand-made feel stays: tape, torn edges, grain, doodles.
79. **Guide chips:** the home and Our Approach tips now point to Montessori at Home instead of the games.
80. **Copy rewordings for change 4:** "House for Children" became "school" on Teach, the About journey heading reads "From after-school to our own school", and the About lead is "Unnati Montessori: an authentic Montessori environment in…". The Day Care subhead now names Mogappair West.
81. **One contact card.** With one number, /contact has a single "Call or WhatsApp" card covering admissions, Day Care, training, hiring and consultancy, plus a "WhatsApp us about consultancy" link that opens the consultancy message. Consultancy CTAs use the same number with the consultancy message.
82. **First plane timeline:** an illustrated 0–6 rail (0–3 and 3–6 halves) with a forest band marking 2½–6 that draws once in view; upright on phones. The six tiles are static pebbles, so there's nothing to tap.
83. **Activity illustrations are the card art too.** Each card shows its scene's first frame, so the card-to-page morph (`activity-{slug}`) lands on the same picture. The five area cards no longer carry a morph name (they'd duplicate the home teaser's names).
84. **"Watch how" engine:** one Web Animations track per moving part across the whole presentation (4.8–6.4 s), eased per segment. When it ends, the final frame is written to inline style and the animations are cancelled, so nothing loops or lingers. Under reduced motion the finished frame and numbered captions show from the start, and tapping the button starts no animation.
85. **Hands:** the scenes use one simple mitten-style child's hand in a warm brown skin tone, with a sage or blush cuff.
86. **Video poster:** a `{slug}.jpg` beside the video is used as its poster when present. Without one, the illustration stays on screen until the clip is tapped, so no frame needs to be extracted at build time (no ffmpeg dependency). Videos never autoplay and play muted.
87. **Area names:** cards and activity pages say "Cultural Studies" (as in 6.2); the filter chip says "Cultural" (as in 4.7.3).
88. **Explorer order and layout:** hotspots run left to right across the room (hooks, shelf, books, table, water corner, stool) so keyboard order matches reading order. The 6.6 copy is unchanged. Leaves alternate high and low so 48 px markers never overlap. On phones the room keeps a 620 px width and scrolls sideways inside its frame (with a "Swipe to see the whole room" hint); the page itself never scrolls sideways.
89. **Hotspot cards open on focus as well as tap,** as the brief says. Each card sits straight after its leaf in the DOM, so Tab goes leaf → card → next leaf. Esc or Close returns focus to the leaf without reopening the card.
90. **Step mode** is a native `<dialog>`: Back/Next (56 px), arrow keys, touch swipe (≥ 50 px, mostly horizontal) and a tap on the backdrop to close. On the last step, Next reads "Done" and closes. The Screen Wake Lock is re-requested if the visitor switches away and back while it's open.
91. **Growth points:** watching a presentation, ticking a Prepared Home item and other taps count 1; marking an activity as tried counts 2 (it replaces "finishing a game", which counted 3); sending an enquiry still counts 3.
92. **Sprout reveal** plays only when arriving at Montessori at Home from another section. Between /at-home and an activity page the card morph carries the transition instead of a second full-screen reveal.
93. **Redirects in two places:** `/play` and `/play/*` → `/at-home` (301) are in `netlify.toml` and repeated in `public/_redirects`, because Netlify drag-and-drop deploys don't read `netlify.toml` redirects reliably.
94. **Print:** activity pages print on one A4 page using the site header's logo (nav and buttons hidden), with a print-only footer line carrying the address, number and web address. The scene, What it builds and the tip are left off to keep it to one page.
95. **Share text** is "{title}: {summary} {page URL}" for both the share sheet and the `wa.me/?text=` fallback.
96. **The "Four Planes" content check is case-sensitive,** because the approved first-plane intro (6.4) says "described four planes of development".
97. **Day Care guide tip** (decision 54) is still unapproved copy and needs the owner's review.
98. **QA rebuild:** `astro.config.mjs` reads an optional `ASTRO_OUT_DIR` so the firstPlaneTitle test can rebuild into `.qa-build/` without touching `dist/` while other tests run.

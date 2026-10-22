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

# Unnati Montessori — website

The website for **Unnati Montessori — A House for Children**, Mogappair West, Chennai.
It is a fast, static site: there is no database and no admin panel. You change it by editing
a few text files and publishing again. This guide assumes no coding experience.

---

## 1. Run it on your computer

You need **Node.js 22 or later** (download from nodejs.org).

Open a terminal in this folder and run:

```
npm install
npm run dev
```

Then open **http://localhost:4321** in your browser. The page updates as you save changes.
Press `Ctrl + C` in the terminal to stop it.

## 2. Change phone numbers, status, timings or the announcement

Everything factual lives in **one file**: `src/config/site.ts`. Open it in any text editor.

| What | Where in `site.ts` |
|------|--------------------|
| School / admissions number | `school: { display, tel, wa }`. `display` is what people see, `tel` is for calls (with +91), `wa` is for WhatsApp (91 + number, no +). |
| Consultancy number | `consultancy: { … }` (same three parts) |
| Address | `address: { … }` and `mapsUrl` |
| Extended Day Care timings | `dayCare.hours`. Leave it as `''` and the site says "Call or WhatsApp us for timings". Example: `hours: 'Monday to Saturday, 8:30 am – 6:30 pm'` |
| Day Care ages | `dayCare.ages` |
| Teacher training start | `teacherTraining.startLabel` |
| Hiring on/off | `hiring.open` (`true` or `false`) |
| Top announcement line | `announcement` |
| Instagram / Facebook / YouTube | `social`. Paste the full link; an icon appears in the footer only when filled. |

### After the school opens

Change `status: 'opening-shortly'` to `status: 'open'`. Every "Opening shortly" label on the site becomes "Now open".

## 3. Edit the words on the pages

- Most approved copy (mission, vision, founder note, programmes, principles, Did you know?, the Day Care page text) is in `src/content/copy.ts`.
- FAQs and consultancy text are in `src/content/faq.ts`.
- Each page's own headings are in `src/pages/` (for example `src/pages/day-care.astro`).

Edit only the text between quotes `'…'`. If a sentence contains an apostrophe inside `'…'`, write it as `\'` (or ask a developer).
**Please don't add fees, timings, ratios or claims that aren't confirmed.** The site is careful about this on purpose.

## 4. Add real photos of the school

Put photos (JPG or PNG) in `brand-assets/photos/`, then ask a developer to add an "Inside Unnati" strip to the About page (at most 6 photos). Photos are compressed automatically when the site is built. Only use photos you have permission to publish, especially of children.

## 5. Add recorded letter sounds (Sandpaper Letters)

Montessori teaches the **sound** of a letter ("sss"), not its name ("ess"), and text-to-speech can only say the name.
So the game never speaks a letter on its own; it only speaks the keyword (sun, ant, tiger…).

To add a real phonetic sound, record it (a short, clear `.mp3`) and save it as:

```
public/audio/sounds/s.mp3
public/audio/sounds/a.mp3
… t, m, p, i, n, c
```

Rebuild the site. Each recording that exists plays before its keyword; missing ones are simply skipped.

## 6. Publish (Netlify)

**Easiest (drag and drop):**
1. Run `npm run build`. This creates a `dist/` folder.
2. Go to **app.netlify.com/drop** and drag the `dist/` folder onto the page.

**Automatic (recommended):** put this folder in a GitHub repository, then in Netlify choose
"Add new site → Import an existing project". The build command (`npm run build`) and publish folder (`dist`)
are already set in `netlify.toml`. Every change you push is published automatically.

### Set your web address

1. In Netlify → Site configuration → Environment variables, add `SITE_URL` = your address, for example `https://www.unnatimontessori.in`.
2. In Netlify → Domain management, connect your domain and follow the DNS steps.
3. Rebuild, so links, the sitemap and share previews use the new address.

### Optional: keep a copy of every enquiry

Enquiries open WhatsApp with the parent's message ready. To also log them in a Google Sheet or Notion,
create a webhook (Make, n8n or Google Apps Script) and add the environment variable
`PUBLIC_ENQUIRY_WEBHOOK_URL` in Netlify. The privacy note updates itself to mention this.

## 7. Get found on Google

1. **Google Search Console** (search.google.com/search-console): add your domain, then submit `https://your-domain/sitemap-index.xml`.
2. **Google Business Profile** (business.google.com): create a profile for "Unnati Montessori" at Chanakyan Cross Road, Annamalai Avenue, Mogappair West, with the school number. This is the single most useful step for local search.

## 8. Ankur the guide and page transitions

- **Edit Ankur's tips:** open `src/config/ankur-tips.ts`. Each page has one short `text` and up to two `actions`
  (buttons). Phone and WhatsApp buttons are built from `src/config/site.ts`, so never type a number there.
- **Turn the guide off:** in `src/config/site.ts`, set `ankurGuide: false` and rebuild. He disappears everywhere.
- **Visitors can hide him** with the "Hide Ankur" button; a small leaf tab brings him back. The choice is remembered on that device.
- **Ankur grows as visitors explore:** sprout → new leaf → another leaf → bud → first flower → second flower.
  Tapping things on the site, opening FAQs and visiting a page for the first time each count 1 point, and finishing a game
  or sending an enquiry counts 3. To make him grow faster or slower, change the `STAGES` numbers (points needed for each
  stage) in `src/scripts/growth.ts`. His growth is remembered on the visitor's device only.
- **Change transition speed:** edit the durations in `src/transitions/animations.ts` (page slide) and the 320 ms / 450 ms
  values in `src/styles/transitions.css` (card morphs and the sprout reveal into Little Hands Corner). Keep each under 500 ms.
- **Reduced motion:** visitors who turn on "Reduce motion" / "Remove animations" see no transitions at all. Pages change
  instantly and Ankur stays still.

## 9. For developers

- Astro (static), TypeScript, plain CSS tokens (`src/styles/`). No UI framework, no Tailwind.
- `npm run check` (type check) · `npm run build` · `npm run preview`
- `npm test` runs the Playwright suites in `tests/` (they need a preview server: `npm run build && npm run preview`).
- `npm run logos` re-creates transparent logos and favicons from `brand-assets/`.
- `npm run og` re-creates the social share image.
- Games live in `src/games/` with a shared engine in `src/games/engine/`.
- Navigation uses Astro's client router. Component scripts must initialise with `onPageLoad` (or `initOnce` for persisted
  elements) from `src/scripts/lifecycle.ts`, and return a cleanup. Plain top-level code runs only once per visit.
- `node scripts/filmstrip.mjs` captures navigation filmstrips into `qa/transitions/` (preview server running).
- Judgement calls are listed in `DECISIONS.md`; QA results are in `qa/REPORT.md`.

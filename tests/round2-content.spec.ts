// Round 2 content checks (brief 5.1): removed copy stays removed, the single number and Plot No. 5
// appear where they should, firstPlaneTitle drives the heading, no green underlines anywhere, and
// every tel:/wa.me link uses the school number.
import { test, expect, type Page } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_PAGES } from './pages';

function files(dir: string, exts: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p, exts) : exts.test(name) ? [p] : [];
  });
}

const TEXT = /\.(astro|ts|mjs|js|css|html|json|md|txt|xml|webmanifest)$/;
const FORBIDDEN: [string, RegExp][] = [
  ['old number', /90035|9003584303|919003584303/],
  ['House for Children', /house (for|of) children|montessori house/i],
  ['/play', /\/play\b/],
  ['Little Hands', /Little Hands/],
  ['Did you know', /Did you know/i],
  // Case-sensitive: the approved first-plane intro says "described four planes of development".
  ['Four Planes', /Four Planes/],
  ['Adolescence', /Adolescence/],
  ['Maturity', /Maturity/],
  ['Reasoning Mind', /Reasoning Mind/],
  ['speechSynthesis', /speechSynthesis/],
  ['AudioContext', /AudioContext/],
  ['unnati:sound', /unnati:sound/],
];

for (const root of ['src', 'dist']) {
  test(`no removed copy or code in ${root}/`, () => {
    // dist/_redirects carries the /play → /at-home redirects on purpose (like netlify.toml).
    const all = files(root, TEXT).filter((f) => !/[\\/]_redirects$/.test(f));
    const hits: string[] = [];
    for (const f of all) {
      const text = readFileSync(f, 'utf8');
      for (const [label, re] of FORBIDDEN) if (re.test(text)) hits.push(`${label}: ${f}`);
    }
    expect(hits).toEqual([]);
  });
}

test('every footer has Plot No. 5 and +91 75500 22403', async ({ page }) => {
  for (const path of ALL_PAGES) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer.site-footer');
    await expect(footer, path).toContainText('Plot No. 5');
    await expect(footer, path).toContainText('+91 75500 22403');
  }
});

test('Plot No. 5 on /contact, in the Find-us panel and in the JSON-LD', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('main')).toContainText('Plot No. 5');
  await page.goto('/');
  await expect(page.locator('[data-map]').first()).toContainText('Plot No. 5');
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld!).address.streetAddress).toContain('Plot No. 5');
});

test('every tel: and wa.me link in dist/ uses 917550022403', () => {
  const bad: string[] = [];
  for (const f of files('dist', /\.html$/)) {
    const html = readFileSync(f, 'utf8');
    for (const [, num] of html.matchAll(/href="tel:\+?(\d+)"/g)) if (num !== '917550022403') bad.push(`${f}: tel ${num}`);
    for (const [, num] of html.matchAll(/https:\/\/wa\.me\/(\d*)/g)) if (num !== '917550022403') bad.push(`${f}: wa.me/${num}`);
  }
  expect(bad).toEqual([]);
  // The only number-less WhatsApp link is the activity Share fallback, built in the browser.
  const js = files('dist/_astro', /\.js$/).map((f) => readFileSync(f, 'utf8')).join('\n');
  expect(js).toContain('https://wa.me/?text=');
});

test('site.firstPlaneTitle is the #first-plane heading (change it, rebuild, check, restore)', () => {
  test.setTimeout(240_000);
  const read = (dir: string) => readFileSync(join(dir, 'approach', 'index.html'), 'utf8');
  const heading = (html: string) => html.match(/<section[^>]*id="first-plane"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1].trim();
  expect(heading(read('dist'))).toBe('The First Plane of Development · Birth to 6');

  const cfg = 'src/config/site.ts';
  const original = readFileSync(cfg, 'utf8');
  const out = '.qa-build';
  try {
    writeFileSync(cfg, original.replace(/firstPlaneTitle: '[^']*'/, "firstPlaneTitle: 'QA Test Title'"));
    execSync('npx astro build', { env: { ...process.env, ASTRO_OUT_DIR: `./${out}` }, stdio: 'pipe' });
    expect(heading(read(out))).toBe('QA Test Title');
  } finally {
    writeFileSync(cfg, original);
    if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  }
});

// ── Green-underline scan ────────────────────────────────────────────────────────────────────────
const GREEN = ['rgb(15, 105, 47)', 'rgb(11, 65, 33)'];

/** Elements (and their ::before/::after) drawing a green underline, bottom border or outline. */
function greenLines(page: Page, scope: 'all' | 'active' | 'hover', hoverSel?: string) {
  return page.evaluate(
    ({ GREEN, scope, hoverSel }) => {
      const roots: Element[] =
        scope === 'all'
          ? [document.documentElement]
          : scope === 'active'
            ? document.activeElement
              ? [document.activeElement]
              : []
            : [...document.querySelectorAll(hoverSel!)].filter((el) => el.matches(':hover'));
      const out: string[] = [];
      const check = (el: Element, pseudo: string | null) => {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return;
        const name = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}${pseudo ?? ''}`;
        if (cs.textDecorationLine !== 'none' && GREEN.includes(cs.textDecorationColor)) out.push(`${name} underline`);
        if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none' && GREEN.includes(cs.borderBottomColor)) out.push(`${name} border-bottom`);
        if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && GREEN.includes(cs.outlineColor)) out.push(`${name} outline`);
      };
      for (const root of roots) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
          check(el, null);
          check(el, '::before');
          check(el, '::after');
        }
      }
      return [...new Set(out)];
    },
    { GREEN, scope, hoverSel },
  );
}

for (const path of ALL_PAGES) {
  for (const w of [360, 1440]) {
    test(`no green underlines: ${path} @ ${w}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await context.newPage();
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await greenLines(page, 'all'), 'resting').toEqual([]);

      // Hover every visible nav link.
      const navLinks = page.locator('header .desktop-nav .nav-link:visible');
      for (let i = 0; i < (await navLinks.count()); i++) {
        await navLinks.nth(i).hover();
        expect(await greenLines(page, 'hover', 'header .nav-link'), `hover nav ${i}`).toEqual([]);
      }

      // Keyboard focus (:focus-visible) through the first 40 tab stops.
      await page.mouse.move(0, 0);
      await page.locator('body').click({ position: { x: 1, y: 1 } }).catch(() => undefined);
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        const found = await greenLines(page, 'active');
        expect(found, `focus stop ${i}`).toEqual([]);
      }
      await context.close();
    });
  }
}

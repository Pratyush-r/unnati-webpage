// Every page at every viewport: screenshot, no horizontal scroll, tap targets ≥ 48 px (≥ 64 in games).
import { test, expect, type Page } from '@playwright/test';
import { ALL_PAGES, GAME_PAGES, VIEWPORTS, GAME_EXTRA_VIEWPORTS, SKIP_SHOWME, slugOf } from './pages';

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, window.innerHeight * 0.6)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(450);
}

/** Interactive elements smaller than min (CSS px). Inline text links inside prose are exempt. */
async function smallTargets(page: Page, min: number) {
  return page.evaluate((min) => {
    const els = Array.from(document.querySelectorAll<HTMLElement | SVGElement>('a[href], button, [role="button"], [role="tab"], [role="radio"], summary, input[type="checkbox"] + .box'));
    const out: string[] = [];
    for (const el of els) {
      if (el.closest('[hidden], [aria-hidden="true"], .skip-link, .is-waiting, .is-locked')) continue;
      if (el.matches('a') && el.closest('p, dd, .answer, figcaption, .privacy li')) continue; // inline text links
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el as Element);
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      const target = el.matches('.box') ? (el.closest('label') as HTMLElement).getBoundingClientRect() : r;
      if (target.width + 0.5 < min || target.height + 0.5 < min) {
        out.push(`${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label')}]` : ''} "${(el.textContent || '').trim().slice(0, 30)}" ${Math.round(target.width)}×${Math.round(target.height)}`);
      }
    }
    return out;
  }, min);
}

for (const path of ALL_PAGES) {
  const isGame = GAME_PAGES.includes(path);
  const sizes = isGame ? [...VIEWPORTS, ...GAME_EXTRA_VIEWPORTS] : VIEWPORTS;
  for (const [w, h] of sizes) {
    test(`responsive ${path} @ ${w}x${h}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      await context.addInitScript(SKIP_SHOWME);
      const page = await context.newPage();
      const res = await page.goto(path, { waitUntil: 'networkidle' });
      if (path !== '/404') expect(res?.status()).toBe(200);
      if (!isGame) await scrollThrough(page);
      else await page.waitForTimeout(400);
      await page.screenshot({ path: `qa/screenshots/${slugOf(path)}-${w}x${h}.png`, fullPage: !isGame });

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0);

      // Games promise 64 px pieces from a 360 px-wide screen up; the site promises 48 px everywhere.
      const min = isGame && w >= 360 ? 64 : 48;
      expect(await smallTargets(page, min), `targets under ${min}px`).toEqual([]);
      await context.close();
    });
  }
}

// Ankur, the floating guide: where he shows, the one-Ankur rule, placement, the bubble, hiding,
// form-field behaviour, the once-per-session greeting and accessibility with the bubble open.
import { test, expect, type Page, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Approved tip copy (add-on brief Section 6) plus the Day Care tip added for the owner's extra page.
const TIPS: Record<string, string> = {
  '/': "Hello, I'm Ankur! Tap anything on the shelf to see it move.",
  '/about': "Unnati means growth. That's why I'm a little sprout!",
  '/approach': 'Tap a principle on the wheel to read about it.',
  '/admissions': 'Good news: children can join any time of the year.',
  '/day-care': 'Extended Day Care welcomes children aged 1–6. Ask us about timings.',
  '/at-home': 'Try one activity this week. Slow and simple is best.',
  '/at-home/pouring-water': 'Show it slowly, say very little, then let your child try.',
  '/teach': 'Our Primary Montessori Teacher Training starts in November 2026.',
  '/consultancy': "Building your own Montessori school? Let's talk.",
  '/contact': "We're near Casagrand Millenia. Tap Get directions for the way.",
};
const GUIDE_PAGES = Object.keys(TIPS);
const NO_GUIDE = ['/404', '/privacy'];
// Mark the greeting as done so it doesn't open the bubble during tests that aren't about it.
const GREETED = `try { sessionStorage.setItem('unnati:ankur-greeted', '1'); } catch (e) {}`;

async function open(browser: Browser, path: string, opts: { greeted?: boolean; w?: number; h?: number; touch?: boolean } = {}) {
  const { greeted = true, w = 1280, h = 800, touch = false } = opts;
  const context = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
  if (greeted) await context.addInitScript(GREETED);
  const page = await context.newPage();
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  return { context, page };
}

/** Scroll past the home shelf so the floating guide comes out. */
async function pastShelf(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-shelf]')!.getBoundingClientRect().bottom + window.scrollY + 200));
  await page.waitForTimeout(1000);
}

const visibleAnkurs = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-ankur]')).filter((el) => {
      const r = el.getBoundingClientRect();
      return getComputedStyle(el).visibility !== 'hidden' && r.width > 0 && r.bottom > 0 && r.top < innerHeight;
    }).length,
  );

test('the guide shows on the guide pages and is hidden on /404 and /privacy', async ({ browser }) => {
  for (const path of GUIDE_PAGES) {
    const { context, page } = await open(browser, path);
    if (path === '/') await pastShelf(page);
    await expect(page.locator('[data-ankur-btn]'), path).toBeVisible();
    await context.close();
  }
  for (const path of NO_GUIDE) {
    const { context, page } = await open(browser, path);
    await expect(page.locator('[data-ankur-btn]'), path).toBeHidden();
    await expect(page.locator('[data-tab]'), path).toBeHidden();
    await context.close();
  }
});

test('one Ankur at a time: hidden while the shelf Ankur is in view, at most one visible while scrolling', async ({ browser }) => {
  const { context, page } = await open(browser, '/');
  await expect(page.locator('.shelf-ankur')).toBeVisible();
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await pastShelf(page);
  await expect(page.locator('[data-ankur-btn]')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await context.close();

  for (const path of [...GUIDE_PAGES, '/404']) {
    const { context: c, page: p } = await open(browser, path, { w: 390, h: 844 });
    const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let i = 0; i < 10; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), Math.round((max * i) / 9));
      await p.waitForTimeout(650);
      expect(await visibleAnkurs(p), `${path} @ step ${i}`).toBeLessThanOrEqual(1);
    }
    await c.close();
  }
});

test('Ankur never covers the action bar, the Enquire button or a submit button', async ({ browser }) => {
  const overlap = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  for (const [w, h] of [[360, 800], [390, 844], [768, 1024], [1440, 900]] as const) {
    for (const path of ['/about', '/admissions', '/contact', '/consultancy']) {
      const { context, page } = await open(browser, path, { w, h });
      const guide = page.locator('[data-ankur-btn]');
      const check = async (sel: string) => {
        const target = page.locator(sel).first();
        if (!(await target.isVisible()) || !(await guide.isVisible())) return;
        const [g, t] = [await guide.boundingBox(), await target.boundingBox()];
        expect(overlap(g!, t!), `${path} ${w}x${h} vs ${sel}`).toBe(false);
      };
      await check('[data-action-bar]');
      await check('header .enquire-btn');
      const submit = page.locator('form[data-form] button[type="submit"]');
      if (await submit.count()) {
        await submit.scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        await check('form[data-form] button[type="submit"]');
      }
      await context.close();
    }
  }
});

test('bubble: opens by tap and Enter, closes by Esc (focus back) and outside tap; tip and chips match', async ({ browser }) => {
  const { context, page } = await open(browser, '/admissions', { w: 390, h: 844, touch: true });
  const btn = page.locator('[data-ankur-btn]');
  const bubble = page.locator('[data-bubble]');
  await btn.tap();
  await expect(bubble).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(bubble.locator('[data-tip]')).toHaveText(TIPS['/admissions']);
  const chips = bubble.locator('[data-chips] a');
  await expect(chips).toHaveCount(2);
  await expect(chips.nth(0)).toHaveText('WhatsApp us');
  expect(await chips.nth(0).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/917550022403\?text=/);
  expect(await chips.nth(1).getAttribute('href')).toBe('tel:+917550022403');
  await page.touchscreen.tap(30, 300); // outside
  await expect(bubble).toBeHidden();
  await context.close();

  const d = await open(browser, '/consultancy');
  await d.page.locator('[data-ankur-btn]').focus();
  await d.page.keyboard.press('Enter');
  await expect(d.page.locator('[data-bubble]')).toBeVisible();
  await expect(d.page.locator('[data-tip]')).toHaveText(TIPS['/consultancy']);
  const c2 = d.page.locator('[data-chips] a');
  expect(await c2.nth(0).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/917550022403\?text=/);
  expect(await c2.nth(1).getAttribute('href')).toBe('tel:+917550022403');
  await d.page.keyboard.press('Escape');
  await expect(d.page.locator('[data-bubble]')).toBeHidden();
  expect(await d.page.evaluate(() => document.activeElement?.hasAttribute('data-ankur-btn'))).toBe(true);

  // A navigation chip works (client-side) and the tip follows the page.
  await d.page.goto('/about', { waitUntil: 'networkidle' });
  await d.page.waitForTimeout(900);
  await d.page.locator('[data-ankur-btn]').click();
  await d.page.locator('[data-chips] a', { hasText: 'Our approach' }).click();
  await d.page.waitForURL('**/approach');
  await d.page.waitForTimeout(800);
  await expect(d.page.locator('[data-bubble]')).toBeHidden();
  await d.page.locator('[data-ankur-btn]').click();
  await expect(d.page.locator('[data-tip]')).toHaveText(TIPS['/approach']);
  await d.context.close();
});

test('Hide Ankur → reload → still hidden (tab shows) → tap the tab → he is back', async ({ browser }) => {
  const { context, page } = await open(browser, '/about');
  await page.locator('[data-ankur-btn]').click();
  await page.locator('[data-hide]').click();
  await expect(page.locator('[data-tab]')).toBeVisible();
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await expect(page.locator('[data-tab]')).toBeVisible();
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('unnati:ankur-hidden'))).toBe('1');
  await page.locator('[data-tab]').click();
  await expect(page.locator('[data-ankur-btn]')).toBeVisible();
  await expect(page.locator('[data-tab]')).toBeHidden();
  await context.close();
});

test('focusing a form field hides the guide; blurring brings him back', async ({ browser }) => {
  const { context, page } = await open(browser, '/admissions', { w: 390, h: 844 });
  await expect(page.locator('[data-ankur-btn]')).toBeVisible();
  await page.locator('#enq-name').focus();
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await page.locator('#enq-mobile').focus();
  await page.waitForTimeout(400);
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.waitForTimeout(1100);
  await expect(page.locator('[data-ankur-btn]')).toBeVisible();
  await context.close();
});

test('the first-session greeting appears once', async ({ browser }) => {
  const { context, page } = await open(browser, '/about', { greeted: false });
  await expect(page.locator('[data-bubble]')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[data-greet]')).toHaveText(/^Good (morning|afternoon|evening)!$/);
  await expect(page.locator('[data-tip]')).toHaveText(TIPS['/about']);
  expect(await page.evaluate(() => document.activeElement?.closest('[data-ankur-guide]'))).toBeNull(); // doesn't take focus
  await expect(page.locator('[data-bubble]')).toBeHidden({ timeout: 6000 });
  for (const href of ['/approach', '/admissions', '/contact']) {
    await page.click(`header .desktop-nav a[href="${href}"]`);
    await page.waitForURL(`**${href}`);
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-bubble]')).toBeHidden();
  }
  await page.locator('[data-ankur-btn]').click();
  await expect(page.locator('[data-greet]')).toBeHidden();
  await context.close();
});

test('axe: no serious or critical violations with the bubble open', async ({ browser }) => {
  for (const path of GUIDE_PAGES) {
    for (const [w, h] of [[390, 844], [1280, 800]] as const) {
      const { context, page } = await open(browser, path, { w, h });
      if (path === '/') await pastShelf(page);
      await page.locator('[data-ankur-btn]').click();
      await expect(page.locator('[data-bubble]')).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), `${path} ${w}`).toEqual([]);
      await context.close();
    }
  }
});

test('dock and bubble screenshots', async ({ browser }) => {
  for (const [w, h] of [[360, 800], [1440, 900]] as const) {
    const { context, page } = await open(browser, '/admissions', { w, h });
    await page.screenshot({ path: `qa/screenshots/ankur-dock-${w}x${h}.png` });
    await page.locator('[data-ankur-btn]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `qa/screenshots/ankur-bubble-${w}x${h}.png` });
    await context.close();
  }
});

test('activity pages: the step-mode chip opens step mode and the guide hides while it is open', async ({ browser }) => {
  const { context, page } = await open(browser, '/at-home/sound-boxes');
  await page.locator('[data-ankur-btn]').click();
  await expect(page.locator('[data-bubble]')).toBeVisible();
  await page.locator('[data-chips] button', { hasText: 'Step-by-step mode' }).click();
  await expect(page.locator('[data-stepmode]')).toBeVisible();
  await expect(page.locator('[data-ankur-btn]')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-stepmode]')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Step-by-step mode' }).first()).toBeFocused();
  await context.close();
});

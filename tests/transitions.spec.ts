// Client-side navigation: persistence, focus, re-initialised components, history, no duplicate
// listeners, reduced motion and unique transition names. Runs in Chromium, Firefox and WebKit.
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
const OPEN_STUB = `window.__opened = []; window.open = (u) => { window.__opened.push(String(u)); return null; };`;

/** Click a link and wait until the router has swapped and finished loading the new page. */
async function go(page: Page, click: () => Promise<unknown>) {
  const before = await page.evaluate(() => document.title);
  await page.evaluate(() => {
    (window as unknown as { __loaded: boolean }).__loaded = false;
    document.addEventListener('astro:page-load', () => ((window as unknown as { __loaded: boolean }).__loaded = true), { once: true });
  });
  await click();
  // A full page load has no __loaded flag; a client-side swap sets it to true.
  await page.waitForFunction((t) => document.title !== t && document.readyState === 'complete' && (window as unknown as { __loaded?: boolean }).__loaded !== false, before, { timeout: 15_000 });
  await page.waitForTimeout(550); // let the ≤ 500 ms transition finish before interacting
}

const nav = (page: Page, href: string) => async () => {
  if (href === '/teach' || href === '/consultancy') {
    await page.click('[data-disclosure] > button');
    await page.click(`.dropdown a[href="${href}"]`);
  } else {
    await page.click(`header .desktop-nav a[href="${href}"]`);
  }
};

async function newContext(browser: { newContext: (o?: object) => Promise<BrowserContext> }, opts: object = {}) {
  const context = await browser.newContext(opts);
  await context.addInitScript(OPEN_STUB);
  return context;
}

test('nav-only tour: URL, H1, title, focus on #main, no console errors, persisted header', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/', { waitUntil: 'networkidle' });
  const tag = `hdr-${Math.random().toString(36).slice(2)}`;
  await page.evaluate((t) => document.querySelector('header.site-header')!.setAttribute('data-test-id', t), tag);

  for (const href of ['/about', '/approach', '/admissions', '/day-care', '/at-home', '/teach', '/consultancy', '/contact']) {
    await go(page, nav(page, href));
    expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(href);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('main');
    expect(await page.evaluate(() => document.querySelector('header.site-header')?.getAttribute('data-test-id'))).toBe(tag);
    await expect(page.locator(`header .desktop-nav a[href="${href}"], header .dropdown a[href="${href}"]`).first()).toHaveAttribute('aria-current', 'page');
  }
  expect(errors).toEqual([]);
  await context.close();
});

test('components work after client-side navigation (desktop)', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/about', { waitUntil: 'networkidle' });

  // Home, reached by the logo link.
  await go(page, () => page.click('header .brand'));
  await page.click('[data-material="maths"]');
  await expect(page.locator('#chip-maths')).toBeVisible();
  await expect(page.locator('[data-material="maths"]')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await page.locator('[data-mode-btn="t"]').first().click();
  await expect(page.locator('[data-compare]').first()).toHaveAttribute('data-mode', 't');

  // Enquiry → exact wa.me URL.
  await page.fill('#enq-name', 'Priya Raman');
  await page.fill('#enq-mobile', '9876543210');
  await page.click('form[data-form] button[type="submit"]');
  const msg = ["Hello Unnati Montessori! I'd like to know more.", 'Parent: Priya Raman', 'Mobile: 9876543210', "Child's age: Not given", 'Interested in: Not sure yet'].join('\n');
  expect(await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)).toEqual([`https://wa.me/917550022403?text=${encodeURIComponent(msg)}`]);

  // Approach: principles wheel with arrow keys.
  await go(page, nav(page, '/approach'));
  await page.locator('.seg').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.seg').nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-panel="1"]')).toBeVisible();

  // Admissions: FAQ opens.
  await go(page, nav(page, '/admissions'));
  await page.locator('.faq summary').first().click();
  await expect(page.locator('.faq details').first()).toHaveAttribute('open', '');

  // Contact: map landmark.
  await go(page, nav(page, '/contact'));
  await page.locator('[data-map]').scrollIntoViewIfNeeded();
  await page.locator('.lm[data-lm="millenia"]').click();
  await expect(page.locator('.lm[data-lm="millenia"]')).toHaveAttribute('aria-pressed', 'true');
  await context.close();
});

test('first plane and Montessori at Home by tap, reached by links (phone)', async ({ browser, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox has no touch emulation in Playwright');
  const context = await newContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: browserName === 'chromium' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });

  const sheetGo = async (href: string) => {
    await page.locator('[data-menu-open]').tap();
    await go(page, () => page.locator(`.sheet-links a[href="${href}"]`).tap());
  };
  await sheetGo('/approach');
  await page.locator('#first-plane').scrollIntoViewIfNeeded();
  await expect(page.locator('#first-plane h2')).toBeVisible();

  await sheetGo('/at-home');
  await page.getByRole('button', { name: 'Sensorial', exact: true }).tap();
  await expect(page.locator('[data-act-grid] [data-activity]:visible')).toHaveCount(1);
  await go(page, () => page.locator('a[href="/at-home/sound-boxes"]').first().tap());
  await expect(page.locator('h1')).toHaveText('Sound Boxes');
  await page.locator('[data-play]').tap();
  await expect(page.locator('[data-play]')).toBeDisabled();
  await page.getByRole('button', { name: 'Step-by-step mode' }).tap();
  await page.locator('[data-sm-next]').tap();
  await expect(page.locator('[data-sm-step]:visible')).toHaveAttribute('aria-label', /^Step 2 of/);
  await page.locator('[data-step-close]').tap();
  await expect(page.locator('[data-stepmode]')).toBeHidden();
  await page.locator('[data-tried]').tap();
  await expect(page.locator('[data-tried]')).toHaveAttribute('aria-pressed', 'true');
  await context.close();
});

test('history back restores scroll; a #hash link lands on and focuses its section', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/approach', { waitUntil: 'networkidle' });
  await page.mouse.move(640, 500);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(700);
  // Click without Playwright's auto-scroll (it would move the page before the router records it).
  await go(page, () => page.evaluate(() => document.querySelector<HTMLAnchorElement>('header .desktop-nav a[href="/admissions"]')!.click()));
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
  await go(page, () => page.goBack());
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBeGreaterThan(1450);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - 1600)).toBeLessThan(40);
  await go(page, () => page.goForward());

  // Admissions FAQ → "See the differences" → /approach#compare
  await page.locator('.faq details').nth(4).locator('summary').click();
  await go(page, () => page.click('.faq a[href="/approach#compare"]'));
  expect(new URL(page.url()).hash).toBe('#compare');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('compare');
  const top = await page.evaluate(() => document.getElementById('compare')!.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(-5);
  expect(top).toBeLessThan(200);
  await context.close();
});

test('/at-home → activity → back ×10 leaves no duplicate listeners', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/at-home', { waitUntil: 'networkidle' });
  for (let i = 0; i < 10; i++) {
    await go(page, () => page.click('a[href="/at-home/peg-counting"]'));
    await go(page, () => page.goBack());
  }
  // One filter handler: a single click gives one announcement and the right count.
  await page.getByRole('button', { name: 'Mathematics', exact: true }).click();
  await expect(page.locator('[data-act-grid] [data-activity]:visible')).toHaveCount(1);
  await go(page, () => page.click('a[href="/at-home/peg-counting"]'));

  // One tried handler (a second would undo the first) and one step-mode handler (a second would skip a step).
  await page.locator('[data-tried]').click();
  await expect(page.locator('[data-tried]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Step-by-step mode' }).click();
  await page.locator('[data-sm-next]').click();
  await expect(page.locator('[data-sm-step]:visible')).toHaveAttribute('aria-label', /^Step 2 of/);
  await page.keyboard.press('Escape');

  // The shelf's click handler runs once per tap (a second handler would close the chip again).
  await go(page, () => page.click('header .brand'));
  await page.click('[data-material="language"]');
  await expect(page.locator('[data-material="language"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#chip-language')).toBeVisible();
  await page.click('[data-material="language"]');
  await expect(page.locator('[data-material="language"]')).toHaveAttribute('aria-expanded', 'false');
  await context.close();
});

test('reduced motion: no animations right after navigation, Ankur still', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/about', { waitUntil: 'networkidle' });
  for (const href of ['/approach', '/admissions', '/at-home']) {
    await go(page, nav(page, href));
    expect(await page.evaluate(() => document.getAnimations().length), href).toBe(0);
    expect(await page.evaluate(() => document.querySelector('[data-ankur-guide]')?.getAnimations({ subtree: true }).length ?? 0)).toBe(0);
  }
  await go(page, () => page.click('a[href="/at-home/pouring-water"].act-link'));
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await context.close();
});

test('every view-transition name is unique on every page', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  for (const path of ['/', '/about', '/approach', '/admissions', '/day-care', '/at-home', '/at-home/pouring-water', '/at-home/sprouting-moong', '/teach', '/consultancy', '/contact', '/privacy', '/404']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*'))
        .map((el) => getComputedStyle(el).getPropertyValue('view-transition-name'))
        .filter((n) => n && n !== 'none'),
    );
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, path).toEqual([]);
  }
  await context.close();
});

test('an activity card illustration and its page scene share one morph name', async ({ browser }) => {
  const context = await newContext(browser, { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const vtName = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).getPropertyValue('view-transition-name'));
  await page.goto('/at-home', { waitUntil: 'networkidle' });
  const card = await vtName('[data-activity="sprouting-moong"] .act-card-art');
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await vtName('.at-home-teaser [data-activity="sprouting-moong"] .act-card-art')).toBe(card);
  await page.goto('/at-home/sprouting-moong', { waitUntil: 'networkidle' });
  expect(await vtName('.scene-stage')).toBe(card);
  expect(card).not.toBe('');
  await context.close();
});

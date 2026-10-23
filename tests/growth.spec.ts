// Ankur keeps growing as the visitor interacts: stages, persistence, sharing across Ankurs,
// first-visit page points, game completion, screen-reader announcement and reduced motion.
import { test, expect, type Page } from '@playwright/test';
import { SKIP_SHOWME } from './pages';

const GREETED = `try { sessionStorage.setItem('unnati:ankur-greeted', '1'); } catch (e) {}`;
const stage = (page: Page, sel: string) => page.locator(sel).first().getAttribute('data-growth');
const points = (page: Page) => page.evaluate(() => Number(localStorage.getItem('unnati:ankur-growth')) || 0);

test('interactions grow Ankur; growth is shared, remembered and announced', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(SKIP_SHOWME);
  await context.addInitScript(GREETED);
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // first visit to this page counts once
  expect(await points(page)).toBe(1);
  expect(await stage(page, '.shelf-ankur')).toBe('0');

  await page.click('[data-material="practical"]');
  await page.click('[data-material="sensorial"]');
  expect(await points(page)).toBe(3);
  expect(await stage(page, '.shelf-ankur')).toBe('1');
  await expect(page.locator('.shelf-ankur')).toHaveClass(/g-on-1/);
  await expect(page.locator('.shelf-ankur .g1')).toBeVisible();
  await expect(page.locator('[data-growth-live]')).toHaveText('Ankur grew a new leaf.');

  // Every Ankur on the page shares the stage (the floating guide too).
  expect(await stage(page, '[data-ankur-guide] [data-ankur]')).toBe('1');

  // Remembered after a reload; revisiting a page doesn't add points.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  expect(await points(page)).toBe(3);
  await expect(page.locator('.shelf-ankur')).toHaveClass(/g-on-1/);

  // A new page adds a point; opening an FAQ adds another; the stage follows on the new page.
  await page.click('header .desktop-nav a[href="/admissions"]');
  await page.waitForURL('**/admissions');
  await page.waitForTimeout(1300);
  expect(await points(page)).toBe(4);
  await page.locator('.faq summary').first().click();
  await page.waitForTimeout(100);
  expect(await points(page)).toBe(5);
  expect(await stage(page, '[data-ankur-guide] [data-ankur]')).toBe('1');
  await context.close();
});

test('finishing a game counts three; he reaches full bloom and stops at the last stage', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(SKIP_SHOWME);
  await context.addInitScript(`try { if (!localStorage.getItem('unnati:ankur-growth')) { localStorage.setItem('unnati:ankur-growth', '24'); localStorage.setItem('unnati:pages-seen', JSON.stringify(['/play/set-the-table'])); } } catch (e) {}`);
  const page = await context.newPage();
  await page.goto('/play/set-the-table', { waitUntil: 'networkidle' });
  expect(await stage(page, '[data-game-ankur] [data-ankur]')).toBe('4');
  for (const id of ['plate', 'katori', 'tumbler', 'spoon', 'napkin']) {
    await page.locator(`[data-p="${id}"]`).focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 6; i++) {
      if ((await page.evaluate(() => (document.activeElement as HTMLElement)?.dataset?.target)) === id) break;
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
  }
  await expect(page.locator('[data-complete]')).toBeVisible();
  expect(await points(page)).toBe(27);
  expect(await stage(page, '[data-game-ankur] [data-ankur]')).toBe('5');
  await expect(page.locator('[data-game-ankur] .g5')).toBeVisible();
  await expect(page.locator('[data-growth-live]')).toHaveText('Ankur has a second flower.');
  await context.close();
});

test('reduced motion: growing plays no animation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await context.addInitScript(SKIP_SHOWME);
  await context.addInitScript(GREETED);
  await context.addInitScript(`try { localStorage.setItem('unnati:ankur-growth', '2'); localStorage.setItem('unnati:pages-seen', JSON.stringify(['/'])); } catch (e) {}`);
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.click('[data-material="language"]');
  expect(await stage(page, '.shelf-ankur')).toBe('1');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await context.close();
});

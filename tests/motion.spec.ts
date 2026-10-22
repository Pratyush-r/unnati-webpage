// With prefers-reduced-motion: reduce, interacting with the shelf, cards, toggle and a game
// leaves no running animations — states change instantly.
import { test, expect, type Page } from '@playwright/test';
import { SKIP_SHOWME } from './pages';

const noAnimations = (page: Page) => page.evaluate(() => document.getAnimations().length);

test('home: shelf, Ankur, flip cards, compare toggle, map', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  for (const m of ['practical', 'sensorial', 'language', 'maths', 'cultural']) {
    await page.click(`[data-material="${m}"]`);
    await page.waitForTimeout(50);
    expect(await noAnimations(page), m).toBe(0);
  }
  await expect(page.locator('#chip-cultural')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#chip-cultural')).toBeHidden();
  await page.click('.shelf-ankur');
  await page.locator('[data-flip]').first().click();
  await expect(page.locator('[data-flip]').first()).toHaveAttribute('aria-pressed', 'true');
  await page.click('[data-mode-btn="t"]');
  await expect(page.locator('[data-compare]').first()).toHaveAttribute('data-mode', 't');
  await page.locator('[data-map]').scrollIntoViewIfNeeded();
  await page.locator('#enquire').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  expect(await noAnimations(page)).toBe(0);
  await context.close();
});

test('approach: principles wheel, planes, reveal', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/approach', { waitUntil: 'networkidle' });
  await page.locator('.seg').nth(3).click();
  await expect(page.locator('[data-panel="3"]')).toBeVisible();
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(200);
  expect(await noAnimations(page)).toBe(0);
  await context.close();
});

test('games: a move, a refusal, show me and completion', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await context.addInitScript(SKIP_SHOWME);
  const page = await context.newPage();
  await page.goto('/play/set-the-table', { waitUntil: 'networkidle' });
  const ids = ['plate', 'katori', 'tumbler', 'spoon', 'napkin'];
  // A refused move first.
  await page.locator('[data-p="plate"]').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  for (const id of ids) {
    await page.locator(`[data-p="${id}"]`).focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 6; i++) {
      if ((await page.evaluate(() => (document.activeElement as HTMLElement)?.dataset?.target)) === id) break;
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(30);
    expect(await noAnimations(page), id).toBe(0);
  }
  await expect(page.locator('[data-complete]')).toBeVisible();
  await page.waitForTimeout(100);
  expect(await noAnimations(page)).toBe(0);
  await page.click('[data-showme]');
  await page.click('[data-again]');
  expect(await noAnimations(page)).toBe(0);

  await page.goto('/play/sandpaper-letters', { waitUntil: 'networkidle' });
  await page.locator('[data-letter]').focus();
  for (let k = 0; k < 12; k++) await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  expect(await noAnimations(page)).toBe(0);
  await context.close();
});

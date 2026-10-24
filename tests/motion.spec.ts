// With prefers-reduced-motion: reduce, interacting with the shelf, toggle and Montessori at Home
// leaves no running animations — states change instantly.
import { test, expect, type Page } from '@playwright/test';

const noAnimations = (page: Page) => page.evaluate(() => document.getAnimations().length);

test('home: shelf, Ankur, compare toggle, map', async ({ browser }) => {
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
  await page.click('[data-mode-btn="t"]');
  await expect(page.locator('[data-compare]').first()).toHaveAttribute('data-mode', 't');
  await page.locator('[data-map]').scrollIntoViewIfNeeded();
  await page.locator('#enquire').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  expect(await noAnimations(page)).toBe(0);
  await context.close();
});

test('approach: principles wheel, first plane, reveal', async ({ browser }) => {
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

test('at home: filters, watch how, step mode, tried, explorer', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/at-home', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Sensorial', exact: true }).click();
  await page.locator('[data-spot-btn]').first().click();
  await page.locator('.check-list input').first().check();
  await page.waitForTimeout(50);
  expect(await noAnimations(page)).toBe(0);

  await page.goto('/at-home/peg-counting', { waitUntil: 'networkidle' });
  await page.locator('[data-play]').click();
  expect(await noAnimations(page)).toBe(0);
  await page.getByRole('button', { name: 'Step-by-step mode' }).click();
  await page.locator('[data-sm-next]').click();
  await page.keyboard.press('Escape');
  await page.locator('[data-tried]').click();
  await page.waitForTimeout(50);
  expect(await noAnimations(page)).toBe(0);
  await context.close();
});

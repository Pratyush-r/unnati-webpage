// Montessori at Home (round 2 brief, 5.2).
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { activities } from '../src/content/at-home';

const card = (page: Page) => page.locator('[data-act-grid] [data-activity]:visible');

test.describe('landing filters', () => {
  test('8 cards; area and age filters give the right counts, update the URL and announce', async ({ page }) => {
    await page.goto('/at-home');
    await expect(card(page)).toHaveCount(8);
    const live = page.locator('[data-f-live]');

    await page.getByRole('button', { name: 'Sensorial', exact: true }).click();
    await expect(card(page)).toHaveCount(1);
    await expect(page).toHaveURL(/area=sensorial/);
    await expect(live).toHaveText('Showing 1 activity');

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: '4+', exact: true }).click();
    await expect(card(page)).toHaveCount(8);
    await expect(page).toHaveURL(/age=4/);

    await page.getByRole('button', { name: '2½+', exact: true }).click();
    await expect(card(page)).toHaveCount(3);
    await expect(live).toHaveText('Showing 3 activities');
    const titles = await card(page).locator('.act-title').allTextContents();
    expect(titles).toEqual(['Pouring Water', 'Spooning Chana', 'Sound Boxes']);
  });

  test('state is read from the URL; empty state offers Show all', async ({ page }) => {
    await page.goto('/at-home?area=maths&age=3');
    await expect(card(page)).toHaveCount(0);
    await expect(page.getByText('No activities match. Try another age.')).toBeVisible();
    await page.getByRole('button', { name: 'Show all' }).click();
    await expect(card(page)).toHaveCount(8);
    await expect(page).toHaveURL(/\/at-home\/?$/);
  });

  test('without JavaScript all cards show and the chips are hidden', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/at-home?area=sensorial');
    await expect(page.locator('[data-act-grid] [data-activity]')).toHaveCount(8);
    await expect(page.locator('[data-filters]')).toBeHidden();
    await ctx.close();
  });
});

test.describe('activity pages', () => {
  for (const a of activities) {
    test(`${a.slug} shows materials, steps, builds, tip${a.safety ? ' and safety' : ''}`, async ({ page }) => {
      await page.goto(`/at-home/${a.slug}`);
      await expect(page.locator('h1')).toHaveText(a.title);
      await expect(page.locator('[data-materials] li')).toHaveCount(a.materials.length);
      await expect(page.locator('.steps li')).toHaveCount(a.steps.length);
      await expect(page.locator('.builds li')).toHaveCount(3);
      await expect(page.locator('.tip')).toContainText(a.tip);
      const safety = page.locator('.safety');
      if (a.safety) await expect(safety).toContainText(a.safety);
      else await expect(safety).toHaveCount(0);
    });
  }
});

test('Watch how plays once and ends; under reduced motion nothing animates', async ({ page, browser }) => {
  await page.goto('/at-home/pouring-water');
  const btn = page.locator('[data-play]');
  await btn.click();
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((x) => (x.effect as KeyframeEffect)?.target?.closest('.act-art')).length)).toBeGreaterThan(0);
  const iterations = await page.evaluate(() => document.getAnimations().map((x) => x.effect?.getTiming().iterations));
  expect(iterations.every((n) => n === 1)).toBe(true);
  await expect(btn).toHaveText(/Watch again/, { timeout: 9000 });
  expect(await page.evaluate(() => document.getAnimations().filter((x) => (x.effect as KeyframeEffect)?.target?.closest('.act-art')).length)).toBe(0);

  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const rm = await ctx.newPage();
  await rm.goto('/at-home/sound-boxes');
  await rm.locator('[data-play]').click();
  expect(await rm.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(rm.locator('.scene-steps')).toBeVisible();
  await ctx.close();
});

test('step mode: next/back, arrow keys, swipe, Esc closes and focus returns', async ({ page }) => {
  const a = activities[0];
  await page.goto(`/at-home/${a.slug}`);
  const open = page.getByRole('button', { name: 'Step-by-step mode' });
  await open.click();
  const dlg = page.locator('[data-stepmode]');
  await expect(dlg).toBeVisible();
  const current = dlg.locator('[data-sm-step]:visible .sm-text');
  await expect(current).toHaveText(a.steps[0]);
  const size = await current.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(22);
  for (const b of await dlg.locator('.sm-btn').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(48);

  for (let i = 1; i < a.steps.length; i++) {
    await dlg.locator('[data-sm-next]').click();
    await expect(current).toHaveText(a.steps[i]);
  }
  await dlg.locator('[data-sm-prev]').click();
  await expect(current).toHaveText(a.steps[a.steps.length - 2]);
  await page.keyboard.press('ArrowLeft');
  await expect(current).toHaveText(a.steps[a.steps.length - 3]);

  // Swipe left (touch pointer) → next step.
  await dlg.locator('[data-sm-body]').evaluate((el) => {
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const opts = (x: number) => ({ bubbles: true, pointerType: 'touch', clientX: x, clientY: y, isPrimary: true });
    el.dispatchEvent(new PointerEvent('pointerdown', opts(r.right - 40)));
    el.dispatchEvent(new PointerEvent('pointerup', opts(r.left + 40)));
  });
  await expect(current).toHaveText(a.steps[a.steps.length - 2]);

  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(open).toBeFocused();
});

test('mark as tried persists and the landing counter shows it; undo works', async ({ page }) => {
  await page.goto('/at-home/sound-boxes');
  const tried = page.locator('[data-tried]');
  await tried.click();
  await expect(tried).toHaveAttribute('aria-pressed', 'true');
  await expect(tried).toContainText('Tried ✓');
  await page.reload();
  await expect(tried).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/at-home');
  await expect(page.locator('[data-tried-count]')).toHaveText("You've tried 1 of 8 activities");
  await expect(page.locator('[data-activity="sound-boxes"] [data-tried-badge]')).toBeVisible();

  await page.goto('/at-home/sound-boxes');
  await tried.click();
  await expect(tried).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/at-home');
  await expect(page.locator('[data-tried-count]')).toBeHidden();
});

test('material ticks persist per activity', async ({ page }) => {
  await page.goto('/at-home/folding-napkins');
  await page.locator('[data-material="1"]').check();
  await page.reload();
  await expect(page.locator('[data-material="1"]')).toBeChecked();
  await expect(page.locator('[data-material="0"]')).not.toBeChecked();
  await page.goto('/at-home/pouring-water');
  await expect(page.locator('[data-material="1"]')).not.toBeChecked();
});

test('share falls back to wa.me/?text= with the activity title', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(url);
      return null;
    }) as typeof window.open;
  });
  await page.goto('/at-home/peg-counting');
  await page.locator('[data-share]').click();
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  expect(opened).toHaveLength(1);
  expect(opened[0]).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(opened[0])).toContain('Peg Counting');
});

test('print: chrome and buttons hidden, fits one A4 page', async ({ page }) => {
  await page.goto('/at-home/slicing-banana');
  await page.emulateMedia({ media: 'print' });
  for (const sel of ['.desktop-nav', '.sticky-bar', '.actions', '.step-open', '.site-footer', '.cta', '.pager']) {
    await expect(page.locator(sel).first()).toBeHidden();
  }
  await expect(page.locator('.print-foot')).toBeVisible();
  await expect(page.locator('.print-foot')).toContainText('Plot No. 5');
  await expect(page.locator('.safety')).toBeVisible();
  const pdf = await page.pdf({ format: 'A4', margin: { top: '14mm', bottom: '12mm', left: '14mm', right: '14mm' }, preferCSSPageSize: true });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  expect(pages).toBe(1);
});

test('explorer: hotspots open/close by tap and keyboard; ticks grow leaves and persist', async ({ page }) => {
  await page.goto('/at-home');
  const spots = page.locator('[data-spot]');
  await expect(spots).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    const s = spots.nth(i);
    await s.locator('[data-spot-btn]').click();
    await expect(s.locator('[data-spot-card]')).toBeVisible();
    await s.locator('[data-spot-close]').click();
    await expect(s.locator('[data-spot-card]')).toBeHidden();
  }
  // Keyboard: focusing a hotspot opens it, Esc closes and keeps focus on the hotspot.
  const first = spots.first().locator('[data-spot-btn]');
  await first.focus();
  await expect(spots.first().locator('[data-spot-card]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(spots.first().locator('[data-spot-card]')).toBeHidden();
  await expect(first).toBeFocused();

  const list = page.locator('.check-list input');
  for (let i = 0; i < 3; i++) await list.nth(i).check();
  await expect(page.locator('[data-home-count]')).toHaveText('Your home has 3 of 6');
  await expect(page.locator('.sprout-leaf.on')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('[data-home-count]')).toHaveText('Your home has 3 of 6');
  await expect(spots.nth(1).locator('[data-have]')).toBeChecked();
});

test('home shelf chips and the five-areas links go to the right activities', async ({ page }) => {
  await page.goto('/');
  const expected = ['pouring-water', 'sound-boxes', 'i-spy-sounds', 'peg-counting', 'sprouting-moong'];
  const hrefs = await page.locator('.areas .area-try').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs).toEqual(expected.map((s) => `/at-home/${s}`));
  const shelf = await page.locator('.chip-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(shelf.sort()).toEqual(expected.map((s) => `/at-home/${s}`).sort());
  for (const s of expected) {
    const res = await page.request.get(`/at-home/${s}`);
    expect(res.status()).toBe(200);
  }
});

test('/play and /play/* redirect to /at-home (netlify rules)', () => {
  const toml = readFileSync('netlify.toml', 'utf8');
  expect(toml).toMatch(/from\s*=\s*"\/play"\s*\n\s*to\s*=\s*"\/at-home"\s*\n\s*status\s*=\s*301/);
  expect(toml).toMatch(/from\s*=\s*"\/play\/\*"\s*\n\s*to\s*=\s*"\/at-home"\s*\n\s*status\s*=\s*301/);
  const redirects = readFileSync('public/_redirects', 'utf8');
  expect(redirects).toMatch(/^\/play\s+\/at-home\s+301/m);
  expect(redirects).toMatch(/^\/play\/\*\s+\/at-home\s+301/m);
});

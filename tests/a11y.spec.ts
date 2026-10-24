// axe-core on every page (mobile and desktop): zero serious or critical violations.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_PAGES } from './pages';

for (const path of ALL_PAGES) {
  for (const [w, h] of [[390, 844], [1280, 800]] as const) {
    test(`a11y ${path} @ ${w}x${h}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await context.close();
    });
  }
}

// Open states: step mode and an explorer card.
test('a11y: step mode open', async ({ page }) => {
  await page.goto('/at-home/pouring-water', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Step-by-step mode' }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

for (const [w, h] of [[390, 844], [1280, 800]] as const) {
  test(`a11y: explorer card open @ ${w}x${h}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    await page.goto('/at-home', { waitUntil: 'networkidle' });
    await page.locator('[data-spot-btn]').nth(1).click();
    await expect(page.locator('[data-spot-card]').nth(1)).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
    await context.close();
  });
}

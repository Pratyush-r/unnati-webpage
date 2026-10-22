// axe-core on every page (mobile and desktop): zero serious or critical violations.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_PAGES, SKIP_SHOWME } from './pages';

for (const path of ALL_PAGES) {
  for (const [w, h] of [[390, 844], [1280, 800]] as const) {
    test(`a11y ${path} @ ${w}x${h}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await context.addInitScript(SKIP_SHOWME);
      const page = await context.newPage();
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await context.close();
    });
  }
}

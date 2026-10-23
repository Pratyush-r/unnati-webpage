// QA helper: navigation filmstrips (screenshots ~0, 120, 240 and 400 ms after a navigation starts).
// Usage: node scripts/filmstrip.mjs  (needs the preview server on :4321)
import { chromium } from '@playwright/test';

const base = 'http://localhost:4321';
const out = 'qa/transitions';
const STEPS = [0, 120, 240, 400];

async function film(page, name, act) {
  const t0 = Date.now();
  const pending = act();
  for (const ms of STEPS) {
    const wait = ms - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${name}-${String(ms).padStart(3, '0')}ms.png`, animations: 'allow' });
  }
  await pending;
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}-end.png` });
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(`try { sessionStorage.setItem('unnati:ankur-greeted','1'); ['set-the-table','knobbed-cylinders','sandpaper-letters','spindle-box','land-air-water'].forEach(s => localStorage.setItem('unnati:showme:'+s,'1')); } catch (e) {}`);
const page = await ctx.newPage();

await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(1200);
await film(page, '1-home-to-approach-slide', () => page.evaluate(() => document.querySelector('header .desktop-nav a[href="/approach"]').click()));

await page.goto(base + '/play', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await film(page, '2-play-to-knobbed-morph-sprout', () => page.evaluate(() => document.querySelector('a.game-card[href="/play/knobbed-cylinders"]').click()));

await film(page, '3-history-back', () => page.goBack());

await page.goto(base + '/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await film(page, '4-about-to-play-sprout-from-nav', () => page.evaluate(() => document.querySelector('header .desktop-nav a[href="/play"]').click()));

await browser.close();
console.log('filmstrips saved to', out);

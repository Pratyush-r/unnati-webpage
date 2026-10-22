// Dev helper: screenshot pages from a running preview server.
// Usage: node scripts/shot.mjs <outDir> <width>x<height> /path [/path ...]
import { chromium } from '@playwright/test';
const [, , out, size, ...paths] = process.argv;
const [width, height] = size.split('x').map(Number);
const base = process.env.BASE || 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: process.env.REDUCE ? 'reduce' : 'no-preference' });
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')) + `-${width}x${height}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage: process.env.FULL !== '0' });
  console.log(name);
}
await browser.close();

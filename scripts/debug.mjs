// Dev helper: open a page, optionally wait / screenshot, and evaluate an expression.
// Usage: node scripts/debug.mjs <path> [expr] [screenshot.png] [waitMs] [WxH]
import { chromium } from '@playwright/test';
const [, , path, expr, shot, waitMs = '500', size = '1280x800'] = process.argv;
const [width, height] = size.split('x').map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(+waitMs);
if (expr) console.log(await page.evaluate(expr));
if (shot) await page.screenshot({ path: shot });
await browser.close();

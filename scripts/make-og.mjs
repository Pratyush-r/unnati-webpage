// Renders the 1200×630 social share card with Playwright → public/og/default.png
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const b64 = (p) => readFileSync(resolve(root, p)).toString('base64');
const html = `<!doctype html><html><head><style>
@font-face { font-family: 'Fraunces'; src: url(data:font/woff2;base64,${b64('public/fonts/fraunces-latin-wght-normal.woff2')}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Nunito'; src: url(data:font/woff2;base64,${b64('public/fonts/nunito-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 1000; }
html, body { margin: 0; }
body { width: 1200px; height: 630px; background: #FDF4E5; display: grid; place-items: center; font-family: Fraunces, serif; position: relative; overflow: hidden; }
.card { display: grid; justify-items: center; gap: 26px; text-align: center; }
img { height: 230px; }
h1 { margin: 0; font-weight: 600; font-size: 44px; color: #763D0D; letter-spacing: -0.01em; }
p { margin: 0; font-family: Nunito, sans-serif; font-weight: 800; font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: #0F692F; }
.vine { position: absolute; left: 0; right: 0; bottom: 34px; display: flex; justify-content: center; }
.band { position: absolute; inset: 18px; border: 2px solid rgba(118,61,13,.18); border-radius: 36px; }
</style></head><body>
<div class="band"></div>
<div class="card">
  <img src="data:image/png;base64,${b64('public/brand/logo-wide-lg@2x.png')}" alt="">
  <h1>A House for Children · Mogappair West, Chennai</h1>
  <p>Authentic Montessori · Ages 2½–6 · Admissions open all year</p>
</div>
<div class="vine"><svg width="320" height="28" viewBox="0 0 320 28"><path d="M4 16 C40 6 70 24 108 15 S170 6 204 15 S270 24 316 12" fill="none" stroke="#763D0D" stroke-width="1.8" opacity=".6"/><path d="M160 11 C164 2 176 0 184 3 C180 12 168 15 160 11 Z" fill="#0F692F"/></svg></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/og/default.png') });
await browser.close();
console.log('public/og/default.png');

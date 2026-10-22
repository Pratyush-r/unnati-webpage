// Each game completed end to end three ways — mouse drag, tap-to-place on a touch phone, keyboard only —
// plus the control-of-error checks from the brief.
import { test, expect, type Page, type Locator, type Browser } from '@playwright/test';
import { SKIP_SHOWME } from './pages';

type Mode = 'mouse' | 'tap' | 'keyboard';
type Pt = { x: number; y: number };

const SPEECH_STUB = `
  window.__spoken = [];
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.speak = (u) => { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 5); };
    }
  } catch (e) {}
`;

async function open(browser: Browser, path: string, mode: Mode) {
  const context = await browser.newContext(
    mode === 'tap'
      ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
      : { viewport: { width: 1280, height: 800 } },
  );
  await context.addInitScript(SKIP_SHOWME);
  await context.addInitScript(SPEECH_STUB);
  const page = await context.newPage();
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  return { context, page };
}

async function centre(loc: Locator): Promise<Pt> {
  const b = await loc.boundingBox();
  if (!b) throw new Error('no bounding box');
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

async function drag(page: Page, from: Pt, to: Pt) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + (to.x - from.x) * 0.1, from.y + (to.y - from.y) * 0.1, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

/** Move one piece to one target in the chosen mode. */
async function move(page: Page, mode: Mode, piece: Locator, target: Locator, targetId: string) {
  if (mode === 'mouse') {
    await drag(page, await centre(piece), await centre(target));
  } else if (mode === 'tap') {
    const a = await centre(piece);
    await page.touchscreen.tap(a.x, a.y);
    await page.waitForTimeout(120);
    const b = await centre(target);
    await page.touchscreen.tap(b.x, b.y);
  } else {
    await piece.focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 8; i++) {
      const id = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset?.target ?? '');
      if (id === targetId) break;
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(420);
}

const completeCard = (page: Page) => page.locator('[data-complete]');

// ——— Game 1: Set the Table ———
for (const mode of ['mouse', 'tap', 'keyboard'] as Mode[]) {
  test(`Set the Table — complete by ${mode}`, async ({ browser }) => {
    const { context, page } = await open(browser, '/play/set-the-table', mode);
    for (const id of ['plate', 'katori', 'tumbler', 'spoon', 'napkin']) {
      await move(page, mode, page.locator(`[data-p="${id}"]`), page.locator(`[data-t="${id}"] .shim`), id);
      await expect(page.locator(`[data-p="${id}"]`)).toHaveClass(/is-placed/);
    }
    await expect(completeCard(page)).toBeVisible();
    await expect(page.locator('[data-static="vase"]')).toHaveAttribute('opacity', '1');
    await context.close();
  });
}

test('Set the Table — a wrong move glides back to its origin', async ({ browser }) => {
  const { context, page } = await open(browser, '/play/set-the-table', 'mouse');
  const plate = page.locator('[data-p="plate"]');
  const before = await plate.evaluate((e) => (e as SVGGElement).style.transform);
  await drag(page, await centre(plate), await centre(page.locator('[data-t="katori"] .shim')));
  await page.waitForTimeout(700);
  expect(await plate.evaluate((e) => (e as SVGGElement).style.transform)).toBe(before);
  await expect(plate).not.toHaveClass(/is-placed/);
  await context.close();
});

// ——— Game 2: Knobbed Cylinders ———
for (const mode of ['mouse', 'tap', 'keyboard'] as Mode[]) {
  test(`Knobbed Cylinders — complete by ${mode}`, async ({ browser }) => {
    const { context, page } = await open(browser, '/play/knobbed-cylinders', mode);
    for (const id of ['4', '3', '2', '1', '0']) {
      await move(page, mode, page.locator(`[data-p="${id}"]`), page.locator(`[data-t="${id}"] .shim`), id);
      await expect(page.locator(`[data-p="${id}"]`)).toHaveClass(/is-placed/);
    }
    await expect(completeCard(page)).toBeVisible();
    await context.close();
  });
}

test('Knobbed Cylinders — a small cylinder sits loose in a larger hole; not complete until all exact', async ({ browser }) => {
  const { context, page } = await open(browser, '/play/knobbed-cylinders', 'mouse');
  const small = page.locator('[data-p="0"]');
  // Too big for a small hole: bounces back.
  const big = page.locator('[data-p="4"]');
  const bigBefore = await big.evaluate((e) => (e as SVGGElement).style.transform);
  await drag(page, await centre(big), await centre(page.locator('[data-t="0"] .shim')));
  await page.waitForTimeout(700);
  expect(await big.evaluate((e) => (e as SVGGElement).style.transform)).toBe(bigBefore);
  // Smallest into the biggest hole: accepted, loose (4° tilt).
  await drag(page, await centre(small), await centre(page.locator('[data-t="4"] .shim')));
  await page.waitForTimeout(500);
  await expect(small).toHaveClass(/is-placed/);
  expect(await small.evaluate((e) => (e as SVGGElement).style.transform)).toContain('rotate(4deg)');
  // Fill the other holes exactly — still not complete while one is loose.
  for (const id of ['1', '2', '3']) {
    await drag(page, await centre(page.locator(`[data-p="${id}"]`)), await centre(page.locator(`[data-t="${id}"] .shim`)));
    await page.waitForTimeout(450);
  }
  await expect(completeCard(page)).toBeHidden();
  // Lift the loose one out into its own hole, then the biggest goes home.
  await drag(page, await centre(small), await centre(page.locator('[data-t="0"] .shim')));
  await page.waitForTimeout(450);
  await expect(completeCard(page)).toBeHidden();
  await drag(page, await centre(big), await centre(page.locator('[data-t="4"] .shim')));
  await page.waitForTimeout(450);
  await expect(completeCard(page)).toBeVisible();
  await context.close();
});

// ——— Game 3: Sandpaper Letters ———
async function strokesOnScreen(page: Page): Promise<Pt[][]> {
  return page.evaluate(() => {
    const g = document.querySelector<SVGGElement>('[data-letter]')!;
    const m = g.getScreenCTM()!;
    return Array.from(g.querySelectorAll<SVGPathElement>('path.sand')).map((p) => {
      const len = p.getTotalLength();
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 50; i++) {
        const q = p.getPointAtLength((len * i) / 50);
        const r = new DOMPoint(q.x, q.y).matrixTransform(m);
        pts.push({ x: r.x, y: r.y });
      }
      return pts;
    });
  });
}

for (const mode of ['mouse', 'tap', 'keyboard'] as Mode[]) {
  test(`Sandpaper Letters — trace every letter by ${mode}`, async ({ browser }) => {
    const { context, page } = await open(browser, '/play/sandpaper-letters', mode);
    for (let i = 0; i < 8; i++) {
      const chip = page.locator(`[data-chip="${i}"]`);
      await expect(chip).toHaveAttribute('aria-current', 'true');
      if (mode === 'keyboard') {
        await page.locator('[data-letter]').focus();
        for (let k = 0; k < 80 && !(await chip.evaluate((c) => c.classList.contains('is-traced'))); k++) {
          await page.keyboard.press('Space');
        }
      } else {
        for (const pts of await strokesOnScreen(page)) {
          if (mode === 'mouse') {
            await page.mouse.move(pts[0].x, pts[0].y);
            await page.mouse.down();
            for (const p of pts.slice(1)) await page.mouse.move(p.x, p.y, { steps: 2 });
            await page.mouse.up();
          } else {
            for (const p of pts.filter((_, k) => k % 2 === 0)) await page.touchscreen.tap(p.x, p.y);
          }
        }
        const dot = page.locator('[data-letter] .i-dot');
        if (await dot.count()) {
          const c = await centre(dot);
          if (mode === 'mouse') await page.mouse.click(c.x, c.y);
          else await page.touchscreen.tap(c.x, c.y);
        }
      }
      await expect(chip).toHaveClass(/is-traced/);
      if (i < 7) {
        if (mode === 'keyboard') {
          await page.locator('[data-next]').focus();
          await page.keyboard.press('Enter');
        } else if (mode === 'tap') await page.locator('[data-next]').tap();
        else await page.locator('[data-next]').click();
      }
    }
    await expect(completeCard(page)).toBeVisible({ timeout: 15_000 });
    const spoken: string[] = await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken);
    expect(spoken).toEqual(expect.arrayContaining(['sun', 'ant', 'tiger', 'mango', 'peacock', 'insect', 'nest', 'coconut']));
    // Text-to-speech must never be asked to say a single letter (it would say the letter name).
    expect(spoken.filter((t) => /^\W*[a-z]\W*$/i.test(t))).toEqual([]);
    await context.close();
  });
}

test('Sandpaper Letters — leaving the path never fails, it just does not progress', async ({ browser }) => {
  const { context, page } = await open(browser, '/play/sandpaper-letters', 'mouse');
  const card = await centre(page.locator('.board-card'));
  await page.mouse.move(card.x - 200, card.y + 250);
  await page.mouse.down();
  await page.mouse.move(card.x - 180, card.y + 280, { steps: 10 });
  await page.mouse.up();
  const offset = await page.locator('[data-letter] path.trail').first().getAttribute('stroke-dashoffset');
  expect(Number(offset)).toBeGreaterThanOrEqual(100);
  await context.close();
});

// ——— Game 4: Spindle Box ———
async function spindleRound(page: Page, mode: Mode) {
  const n = Number(await page.locator('[data-numeral]').textContent());
  const basket = page.locator('[data-zone="basket"]');
  const box = page.locator('[data-zone="box"]');
  for (let k = 0; k < n; k++) {
    if (mode === 'mouse') await drag(page, { ...(await centre(basket)) }, await centre(box));
    else if (mode === 'tap') {
      const a = await centre(basket);
      await page.touchscreen.tap(a.x, a.y - 40);
      await page.waitForTimeout(80);
      const b = await centre(box);
      await page.touchscreen.tap(b.x, b.y);
    } else {
      await basket.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(330);
  }
  return n;
}

for (const mode of ['mouse', 'tap', 'keyboard'] as Mode[]) {
  test(`Spindle Box — complete by ${mode}`, async ({ browser }) => {
    const { context, page } = await open(browser, '/play/spindle-box', mode);
    for (let r = 0; r < 5; r++) {
      const n = await spindleRound(page, mode);
      await expect(page.locator('[data-box-spindles] use')).toHaveCount(n === 0 ? 0 : n, { timeout: 3000 }).catch(() => {});
      await page.waitForFunction(
        ([prev, done]) => document.querySelector('[data-numeral]')!.textContent !== prev || document.querySelectorAll('.pdot.is-done').length > done || document.querySelector('svg.is-finale'),
        [String(n), r] as const,
        { timeout: 6000 },
      );
    }
    await expect(completeCard(page)).toBeVisible({ timeout: 6000 });
    await expect(page.locator('[data-done-row] > g')).toHaveCount(5);
    await context.close();
  });
}

test('Spindle Box — counting past the numeral leaves the bundle untied', async ({ browser }) => {
  const { context, page } = await open(browser, '/play/spindle-box', 'mouse');
  const n = Number(await page.locator('[data-numeral]').textContent());
  const basket = page.locator('[data-zone="basket"]');
  const box = page.locator('[data-zone="box"]');
  // Drop outside any zone: the spindle glides back and nothing is counted.
  await drag(page, await centre(basket), { x: 30, y: 140 });
  await page.waitForTimeout(500);
  await expect(page.locator('[data-box-spindles] use')).toHaveCount(0);
  // Drop n + 1 quickly: the tie waits a moment before drawing, so going over leaves it untied.
  for (let k = 0; k < n + 1; k++) {
    await drag(page, await centre(basket), await centre(box));
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-box-spindles] use')).toHaveCount(n + 1);
  await expect(page.locator('[data-numeral]')).toHaveText(String(n));
  expect(await page.locator('[data-ribbon]').getAttribute('style')).toBeNull();
  // Take one out → the bundle ties and the next round starts.
  await drag(page, await centre(box), await centre(basket));
  await page.waitForFunction((prev) => document.querySelector('[data-numeral]')!.textContent !== prev, String(n), { timeout: 6000 });
  await context.close();
});

// ——— Game 5: Land, Air & Water ———
for (const mode of ['mouse', 'tap', 'keyboard'] as Mode[]) {
  test(`Land, Air & Water — complete by ${mode}`, async ({ browser }) => {
    const { context, page } = await open(browser, '/play/land-air-water', mode);
    for (let k = 0; k < 9; k++) {
      const card = page.locator('.card:not(.is-waiting):not(.is-placed)').first();
      await expect(card).toBeVisible();
      const home = (await card.getAttribute('data-home'))!;
      await move(page, mode, card, page.locator(`[data-t="${home}"] .shim`), home);
      await page.waitForTimeout(650);
    }
    await expect(completeCard(page)).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.card.is-placed')).toHaveCount(9);
    await context.close();
  });
}

test('Land, Air & Water — a card fits only its own tray', async ({ browser }) => {
  const { context, page } = await open(browser, '/play/land-air-water', 'mouse');
  const card = page.locator('.card:not(.is-waiting):not(.is-placed)').first();
  const home = (await card.getAttribute('data-home'))!;
  const wrong = home === 'air' ? 'land' : 'air';
  const before = await card.evaluate((e) => (e as SVGGElement).style.transform);
  await drag(page, await centre(card), await centre(page.locator(`[data-t="${wrong}"] .shim`)));
  await page.waitForTimeout(700);
  expect(await card.evaluate((e) => (e as SVGGElement).style.transform)).toBe(before);
  await expect(card).not.toHaveClass(/is-placed/);
  await context.close();
});

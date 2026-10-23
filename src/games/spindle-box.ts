// Game 4 — Spindle Box (Mathematics). 5 rounds, numerals 1–9 without repeats.
// Each spindle dropped in is counted aloud. When the count equals the numeral, a green ribbon ties
// the bundle — the material's control of error. Too many: nothing ties, Ankur tilts once (no words).
import { Board, dist, glide, place, shimmy, shuffle, type Layout, type Pt } from './engine/board';
import { initShell } from './engine/shell';
import { showMove } from './engine/showme';
import { announce } from './engine/announce';
import { speak } from './engine/speech';
import { tok, unlockAudio } from './engine/audio';
import { settle, wait } from '../lib/motion';
import { onGamePage } from './engine/shell';
import { onPageLoad } from '../scripts/lifecycle';

// The router keeps this module loaded across navigations, so the game starts on each visit to
// its page and cleans up (listeners, observers, timers, speech, audio) when the page changes.
function start(): void | (() => void) {
  if (!onGamePage('spindle-box')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const ROUNDS = 5;
  const TOTAL = 10;

  const svg = document.querySelector<SVGSVGElement>('[data-board-svg]')!;
  const board = new Board(svg);
  const ac = new AbortController();
  const signal = ac.signal;
  const boxZone = svg.querySelector<SVGGElement>('[data-zone="box"]')!;
  const basketZone = svg.querySelector<SVGGElement>('[data-zone="basket"]')!;
  const boxSpindles = svg.querySelector<SVGGElement>('[data-box-spindles]')!;
  const basketSpindles = svg.querySelector<SVGGElement>('[data-basket-spindles]')!;
  const ribbon = svg.querySelector<SVGPathElement>('[data-ribbon]')!;
  const numeralEl = svg.querySelector<SVGTextElement>('[data-numeral]')!;
  const held = svg.querySelector<SVGGElement>('[data-held]')!;
  const doneRow = svg.querySelector<SVGGElement>('[data-done-row]')!;
  const progress = svg.querySelector<SVGGElement>('[data-static="progress"]')!;

  const L: Record<Layout, { box: Pt; basket: Pt; progress: Pt; done: Pt; doneGap: number }> = {
    landscape: { box: { x: 400, y: 450 }, basket: { x: 920, y: 520 }, progress: { x: 600, y: 48 }, done: { x: 600, y: 470 }, doneGap: 220 },
    portrait: { box: { x: 400, y: 420 }, basket: { x: 400, y: 960 }, progress: { x: 400, y: 48 }, done: { x: 400, y: 560 }, doneGap: 150 },
  };

  let numerals: number[] = [];
  let round = 0;
  let inBox = 0;
  let tilted = false;
  let tying = false;
  let holding: null | 'basket' | 'box' = null;
  let keyboard = false;
  let drag: { id: number; start: Pt; moved: boolean; from: 'basket' | 'box' } | null = null;

  const target = () => numerals[round];
  const numberSentence = (n: number) => `This is ${WORDS[n]}. Put ${WORDS[n]} spindle${n === 1 ? '' : 's'} in the box.`;

  function spindle(parent: Element, x: number, y: number, rotate = 0, scale = 1): SVGUseElement {
    const u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#spindle');
    u.setAttribute('transform', `translate(${x} ${y}) rotate(${rotate}) scale(${scale})`);
    parent.appendChild(u);
    return u;
  }

  const boxSpindleX = (i: number) => -162 + i * 36;

  function render(): void {
    boxSpindles.replaceChildren();
    for (let i = 0; i < inBox; i++) spindle(boxSpindles, boxSpindleX(i), 30);
    basketSpindles.replaceChildren();
    const left = TOTAL - inBox;
    for (let i = 0; i < left; i++) spindle(basketSpindles, -150 + i * 33, -150 - (i % 2) * 14, -18 + i * 4);
    boxZone.setAttribute('aria-label', `Spindle box, number ${target()}, ${inBox} spindle${inBox === 1 ? '' : 's'} inside`);
    basketZone.setAttribute('aria-label', `Basket of spindles, ${left} left`);
    progress.querySelectorAll('.pdot').forEach((d, i) => d.classList.toggle('is-done', i < round));
  }

  function startRound(): void {
    inBox = 0;
    tilted = false;
    ribbon.setAttribute('d', '');
    ribbon.removeAttribute('style');
    numeralEl.textContent = String(target());
    render();
  }

  function zonePos(z: 'box' | 'basket'): Pt {
    return L[board.layout][z];
  }

  function layoutAll(l: Layout): void {
    const c = L[l];
    place(boxZone, c.box);
    place(basketZone, c.basket);
    place(progress, c.progress);
    layoutDoneRow();
  }
  board.onLayout(layoutAll);

  // ——— holding ———
  function showHeld(p: Pt): void {
    held.style.opacity = '1';
    place(held, p);
  }
  function hideHeld(): void {
    held.style.opacity = '0';
  }
  function setHolding(from: null | 'basket' | 'box'): void {
    holding = from;
    boxZone.classList.toggle('is-candidate', from === 'basket');
    basketZone.classList.toggle('is-candidate', from === 'box');
    if (from) {
      const p = zonePos(from);
      showHeld({ x: p.x, y: p.y - (from === 'basket' ? 200 : 60) });
      announce(from === 'basket' ? 'Picked up a spindle' : 'Took a spindle out');
    } else {
      hideHeld();
    }
  }

  async function dropInBox(from: Pt): Promise<void> {
    const to = { x: zonePos('box').x + boxSpindleX(inBox), y: zonePos('box').y + 30 };
    setHolding(null);
    showHeld(from);
    await glide(held, from, to, { duration: 220 });
    hideHeld();
    inBox++;
    render();
    tok();
    void speak(WORDS[inBox]);
    announce(`${inBox} in the box`);
    if (keyboard) basketZone.focus();
    void check();
  }

  async function returnToBasket(from: Pt): Promise<void> {
    setHolding(null);
    showHeld(from);
    await glide(held, from, { x: zonePos('basket').x, y: zonePos('basket').y - 150 }, { duration: 260 });
    hideHeld();
    inBox--;
    render();
    announce(`${inBox} in the box`);
    if (keyboard) boxZone.focus();
    void check();
  }

  async function cancelHold(from: Pt): Promise<void> {
    const origin = holding ?? drag?.from;
    setHolding(null);
    if (!origin) return;
    showHeld(from);
    const back = origin === 'basket' ? { x: zonePos('basket').x, y: zonePos('basket').y - 150 } : { x: zonePos('box').x + boxSpindleX(inBox - 1), y: zonePos('box').y + 30 };
    await glide(held, from, back);
    hideHeld();
    if (origin === 'box') render();
  }

  let checkToken = 0;
  async function check(): Promise<void> {
    const token = ++checkToken;
    const n = target();
    if (inBox > n) {
      if (!tilted) {
        tilted = true;
        void shell.ankur('tilt');
      }
      return;
    }
    if (inBox <= n) tilted = false;
    if (inBox !== n || tying) return;
    // A short pause before tying; any further move cancels it and re-checks.
    await wait(450);
    if (token !== checkToken || inBox !== n) return;
    tying = true;
    const x0 = boxSpindleX(0) - 22;
    const x1 = boxSpindleX(n - 1) + 22;
    const mid = (x0 + x1) / 2;
    ribbon.setAttribute('d', `M${x0} 40 C${x0 + 10} 52 ${x1 - 10} 52 ${x1} 40 M${mid} 46 C${mid - 26} 20 ${mid - 44} 40 ${mid - 30} 58 C${mid - 20} 66 ${mid - 6} 56 ${mid} 46 C${mid + 26} 20 ${mid + 44} 40 ${mid + 30} 58 C${mid + 20} 66 ${mid + 6} 56 ${mid} 46 M${mid} 46 L${mid - 16} 84 M${mid} 46 L${mid + 16} 84`);
    await settle(ribbon, [{ strokeDashoffset: '101' }, { strokeDashoffset: '0' }], { duration: 600 });
    tok();
    announce('Tied');
    void shell.ankur('nod');
    await wait(900);
    round++;
    addDoneBundle(n);
    tying = false;
    if (round >= ROUNDS) {
      render();
      finale();
      return;
    }
    startRound();
    await wait(200);
    void speak(numberSentence(target()));
  }

  // ——— done bundles ———
  const doneBundles: number[] = [];
  function addDoneBundle(n: number): void {
    doneBundles.push(n);
  }
  function layoutDoneRow(): void {
    doneRow.replaceChildren();
    if (!svg.classList.contains('is-finale')) return;
    const c = L[board.layout];
    const portrait = board.layout === 'portrait';
    doneBundles.forEach((n, i) => {
      const g = document.createElementNS(NS, 'g');
      const col = portrait ? i % 3 : i;
      const row = portrait ? Math.floor(i / 3) : 0;
      const perRow = portrait ? (row === 0 ? 3 : 2) : 5;
      const x = c.done.x + (col - (perRow - 1) / 2) * c.doneGap;
      const y = c.done.y + (portrait ? (row - 0.5) * 430 : 0);
      g.setAttribute('transform', `translate(${x} ${y})`);
      for (let k = 0; k < n; k++) spindle(g, (k - (n - 1) / 2) * 13, 0, 0, 0.7);
      const w = (n - 1) * 13 + 30;
      const r = document.createElementNS(NS, 'path');
      r.setAttribute('d', `M${-w / 2} 6 C${-w / 4} 16 ${w / 4} 16 ${w / 2} 6`);
      r.setAttribute('class', 'ribbon');
      r.setAttribute('style', 'stroke-dashoffset:0;stroke-width:9');
      g.appendChild(r);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'bundle-num');
      t.setAttribute('y', '170');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = String(n);
      g.appendChild(t);
      doneRow.appendChild(g);
    });
  }

  function finale(): void {
    svg.classList.add('is-finale');
    layoutDoneRow();
    shell.complete();
  }

  // ——— pointer ———
  function zoneAt(e: Event): 'box' | 'basket' | null {
    const z = (e.target as Element).closest<SVGGElement>('[data-zone]');
    return (z?.dataset.zone as 'box' | 'basket') ?? null;
  }
  function nearestZone(p: Pt): 'box' | 'basket' | null {
    const db = dist(p, zonePos('box'));
    const dk = dist(p, zonePos('basket'));
    if (db < 300 && db <= dk) return 'box';
    if (dk < 280) return 'basket';
    return null;
  }

  svg.addEventListener('pointerdown', (e) => {
    unlockAudio();
    keyboard = false;
    if (tying || svg.classList.contains('is-finale')) return;
    const z = zoneAt(e);
    if (!z) return;
    e.preventDefault();
    try { svg.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag = { id: e.pointerId, start: board.toSvg(e.clientX, e.clientY), moved: false, from: z };
  }, { signal });

  svg.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const p = board.toSvg(e.clientX, e.clientY);
    if (!drag.moved && dist(p, drag.start) < 10) return;
    if (!drag.moved) {
      // Start dragging a spindle out of where the finger went down.
      if (holding) setHolding(null);
      if (drag.from === 'basket' && inBox >= TOTAL) { drag = null; return; }
      if (drag.from === 'box' && inBox === 0) { drag = null; return; }
      drag.moved = true;
      if (drag.from === 'box') {
        inBox--;
        render();
        inBox++;
      }
    }
    showHeld(p);
  }, { signal });

  svg.addEventListener('pointerup', (e) => {
    const p = board.toSvg(e.clientX, e.clientY);
    if (drag && drag.id === e.pointerId) {
      const d = drag;
      drag = null;
      if (d.moved) {
        const z = nearestZone(p);
        if (d.from === 'basket' && z === 'box') void dropInBox(p);
        else if (d.from === 'box' && z === 'basket') void returnToBasket(p);
        else {
          if (z) shimmy(svg.querySelector(`[data-zone="${z}"] .shim`));
          void (async () => {
            holding = d.from;
            await cancelHold(p);
          })();
        }
        return;
      }
      tapZone(d.from);
      return;
    }
    if (holding && !zoneAt(e)) void cancelHold(held.style.opacity === '1' ? heldPos() : p);
  }, { signal });

  function heldPos(): Pt {
    const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(held.style.transform);
    return m ? { x: +m[1], y: +m[2] } : zonePos('box');
  }

  function tapZone(z: 'box' | 'basket'): void {
    if (tying) return;
    if (!holding) {
      if (z === 'basket' && inBox < TOTAL) setHolding('basket');
      else if (z === 'box' && inBox > 0) {
        inBox--;
        render();
        inBox++;
        setHolding('box');
      }
      if (keyboard && holding) (holding === 'basket' ? boxZone : basketZone).focus();
      return;
    }
    if (holding === 'basket' && z === 'box') void dropInBox(heldPos());
    else if (holding === 'box' && z === 'basket') void returnToBasket(heldPos());
    else void cancelHold(heldPos());
  }

  // ——— keyboard ———
  [boxZone, basketZone].forEach((zone) =>
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        unlockAudio();
        keyboard = true;
        tapZone(zone.dataset.zone as 'box' | 'basket');
      } else if (e.key === 'Escape' && holding) {
        e.preventDefault();
        void cancelHold(heldPos());
      }
    }, { signal }),
  );

  function newSession(): void {
    numerals = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, ROUNDS);
    round = 0;
    doneBundles.length = 0;
    svg.classList.remove('is-finale');
    doneRow.replaceChildren();
    startRound();
  }
  newSession();

  const shell = initShell({
    slug: 'spindle-box',
    intro: numberSentence(target()),
    done: 'You counted them all.',
    demo: () => {
      const b = zonePos('basket');
      const x = zonePos('box');
      const src = svg.querySelector('#spindle');
      if (inBox > target()) return showMove(svg, { x: x.x + boxSpindleX(inBox - 1), y: x.y + 30 }, { x: b.x, y: b.y - 150 }, src);
      return showMove(svg, { x: b.x, y: b.y - 150 }, { x: x.x + boxSpindleX(inBox), y: x.y + 30 }, src);
    },
    onAgain: () => {
      newSession();
      layoutAll(board.layout);
      basketZone.focus({ preventScroll: true });
      void speak(numberSentence(target()));
    },
  });

  return () => {
    ac.abort();
    shell.destroy();
    board.destroy();
  };
}

onPageLoad(start);

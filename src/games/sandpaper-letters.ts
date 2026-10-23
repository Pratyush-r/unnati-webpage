// Game 3 — Sandpaper Letters (Language). Trace with one finger or the mouse. Checkpoints every ~4%
// along each stroke count in order when the pointer passes within ~9% of letter height. Leaving the
// path never fails — it just doesn't progress. Letters are never spoken alone (TTS would say the
// letter name); only the keyword is spoken, after a recorded phonetic sound when one exists.
import { Board, place, type Layout, type Pt } from './engine/board';
import { initShell } from './engine/shell';
import { showTrace } from './engine/showme';
import { announce } from './engine/announce';
import { playFile, tok, unlockAudio } from './engine/audio';
import { settle, EASE_POP } from '../lib/motion';
import { LETTERS } from './letters';
import { onGamePage } from './engine/shell';
import { onPageLoad } from '../scripts/lifecycle';

// The router keeps this module loaded across navigations, so the game starts on each visit to
// its page and cleans up (listeners, observers, timers, speech, audio) when the page changes.
function start(): void | (() => void) {
  if (!onGamePage('sandpaper-letters')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector<SVGSVGElement>('[data-board-svg]')!;
  const board = new Board(svg);
  const ac = new AbortController();
  const signal = ac.signal;
  const card = svg.querySelector<SVGGElement>('[data-static="card"]')!;
  const picture = svg.querySelector<SVGGElement>('[data-static="picture"]')!;
  const letterG = svg.querySelector<SVGGElement>('[data-letter]')!;
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-chip]'));
  const sounds = new Set((svg.dataset.sounds || '').split(',').filter(Boolean));

  const S = 4.4; // letter box (100 × 120) → card units
  const STROKE = 11; // ≈ 18% of the x-height letter
  const RADIUS = 11; // ≈ 9% of the letter box height
  const STEP = 0.04;

  const L: Record<Layout, { card: Pt; cardScale: number; pic: Pt; picScale: number }> = {
    landscape: { card: { x: 380, y: 400 }, cardScale: 1.2, pic: { x: 900, y: 400 }, picScale: 1.2 },
    portrait: { card: { x: 400, y: 430 }, cardScale: 1.3, pic: { x: 400, y: 1010 }, picScale: 0.9 },
  };

  type StrokeState = { path: SVGPathElement; trail: SVGPathElement; cps: Pt[] };
  let index = 0;
  let strokes: StrokeState[] = [];
  let active = 0;
  let progress = 0;
  let dotActive = false;
  let letterDone = false;
  let tracing: number | null = null;
  const traced = new Set<number>();

  function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element): SVGElementTagNameMap[K] {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    parent.appendChild(n);
    return n;
  }

  function build(i: number): void {
    const def = LETTERS[i];
    letterG.replaceChildren();
    letterG.setAttribute('transform', `scale(${S}) translate(-50 -65)`);
    letterG.setAttribute('aria-label', `Trace the letter for ${def.word}. Press Space to trace.`);
    el('rect', { x: 0, y: 0, width: 100, height: 120, fill: 'transparent' }, letterG);
    strokes = def.strokes.map((d) => {
      const path = el('path', { d, class: 'sand', 'stroke-width': STROKE }, letterG);
      const trail = el('path', { d, class: 'trail', 'stroke-width': STROKE, pathLength: 100, 'stroke-dasharray': '100 200', 'stroke-dashoffset': 101 }, letterG);
      const len = path.getTotalLength();
      const cps: Pt[] = [];
      for (let t = 0; t <= 1.0001; t += STEP) {
        const p = path.getPointAtLength(Math.min(t, 1) * len);
        cps.push({ x: p.x, y: p.y });
      }
      return { path, trail, cps };
    });
    if (def.dot) {
      el('circle', { cx: def.dot.x, cy: def.dot.y, r: 12, class: 'i-dot-ring' }, letterG);
      el('circle', { cx: def.dot.x, cy: def.dot.y, r: 7, class: 'i-dot' }, letterG);
    }
    el('g', { class: 'guides' }, letterG);
    svg.classList.toggle('is-vowel-card', def.vowel);
  }

  function guides(): void {
    const g = letterG.querySelector('.guides')!;
    g.replaceChildren();
    letterG.classList.toggle('dot-active', dotActive);
    if (letterDone || dotActive) return;
    const { cps } = strokes[active];
    el('circle', { cx: cps[0].x, cy: cps[0].y, r: 4.6, class: 'start-dot' }, g);
    [0.35, 0.7].forEach((f) => {
      const k = Math.round(f * (cps.length - 1));
      const a = cps[k - 1], b = cps[k + 1] ?? cps[k];
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      el('path', { d: 'M-2.6 -3.4 L3.4 0 L-2.6 3.4 Z', class: 'dir-arrow', transform: `translate(${cps[k].x} ${cps[k].y}) rotate(${ang}) translate(0 -9)` }, g);
    });
  }

  function setTrail(s: StrokeState, n: number): void {
    const pct = n <= 1 ? 0 : ((n - 1) / (s.cps.length - 1)) * 100;
    // An empty trail sits fully in the gap (offset 101) so no round cap shows.
    s.trail.setAttribute('stroke-dashoffset', String(pct <= 0 ? 101 : 100 - Math.min(100, pct)));
  }

  function go(i: number): void {
    index = (i + LETTERS.length) % LETTERS.length;
    build(index);
    active = 0;
    progress = 0;
    dotActive = false;
    letterDone = traced.has(index);
    if (letterDone) strokes.forEach((s) => setTrail(s, s.cps.length));
    if (letterDone && LETTERS[index].dot) letterG.querySelector('.i-dot')?.classList.add('is-done');
    guides();
    chips.forEach((c, k) => c.setAttribute('aria-current', String(k === index)));
    chips[index].scrollIntoView({ block: 'nearest', inline: 'center' });
    showPicture(letterDone, false);
  }

  function showPicture(on: boolean, pop: boolean): void {
    picture.querySelectorAll('.pic').forEach((p) => p.classList.toggle('is-on', (p as SVGGElement).dataset.pic === LETTERS[index].letter));
    picture.style.opacity = on ? '1' : '0';
    if (on && pop) void settle(picture, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE_POP });
  }

  function toLetter(clientX: number, clientY: number): Pt {
    const m = letterG.getScreenCTM();
    if (!m) return { x: -999, y: -999 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  const near = (a: Pt, b: Pt, r = RADIUS) => Math.hypot(a.x - b.x, a.y - b.y) <= r;

  function advance(p: Pt | null, steps = 0): void {
    if (letterDone) return;
    if (dotActive) {
      const d = LETTERS[index].dot!;
      if (!p || near(p, d, 14)) completeLetter();
      return;
    }
    const s = strokes[active];
    if (p) {
      let moved = true;
      while (moved && progress < s.cps.length) {
        moved = false;
        for (let k = 0; k < 4 && progress + k < s.cps.length; k++) {
          if (near(p, s.cps[progress + k])) {
            progress = progress + k + 1;
            moved = true;
            break;
          }
        }
      }
    } else {
      progress = Math.min(s.cps.length, progress + steps);
    }
    setTrail(s, progress);
    if (progress >= s.cps.length) strokeDone();
  }

  function strokeDone(): void {
    tok();
    const def = LETTERS[index];
    if (active < strokes.length - 1) {
      active++;
      progress = 0;
      announce('Next stroke');
    } else if (def.dot) {
      dotActive = true;
      announce('Now tap the dot');
    } else {
      completeLetter();
      return;
    }
    guides();
  }

  async function completeLetter(): Promise<void> {
    const def = LETTERS[index];
    letterDone = true;
    dotActive = false;
    letterG.querySelector('.i-dot')?.classList.add('is-done');
    guides();
    traced.add(index);
    chips[index].classList.add('is-traced');
    showPicture(true, true);
    announce(`Traced. ${def.word}`);
    void shell.ankur('nod');
    const allDone = traced.size === LETTERS.length;
    if (sounds.has(def.letter)) await playFile(`/audio/sounds/${def.letter}.mp3`);
    await shell.say(def.word, 0.7);
    if (allDone) shell.complete();
  }

  // Pointer tracing (finger or mouse). Taps along the path count too.
  svg.addEventListener('pointerdown', (e) => {
    if (!(e.target as Element).closest('[data-static="card"]')) return;
    unlockAudio();
    tracing = e.pointerId;
    try { svg.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    advance(toLetter(e.clientX, e.clientY));
  }, { signal });
  svg.addEventListener('pointermove', (e) => {
    if (tracing !== e.pointerId) return;
    const events = e.getCoalescedEvents?.() ?? [e];
    for (const ev of events.length ? events : [e]) advance(toLetter(ev.clientX, ev.clientY));
  }, { signal });
  const stop = (e: PointerEvent) => {
    if (tracing === e.pointerId) tracing = null;
  };
  svg.addEventListener('pointerup', stop, { signal });
  svg.addEventListener('pointercancel', stop, { signal });

  // Keyboard: Space / Enter traces along the active stroke (or taps the dot).
  letterG.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    unlockAudio();
    advance(null, 3);
  }, { signal });

  document.querySelector('[data-prev]')!.addEventListener('click', () => go(index - 1), { signal });
  document.querySelector('[data-next]')!.addEventListener('click', () => go(index + 1), { signal });
  chips.forEach((c, k) => c.addEventListener('click', () => go(k), { signal }));

  board.onLayout((l) => {
    const c = L[l];
    place(card, c.card, 0, c.cardScale);
    place(picture, c.pic, 0, c.picScale);
  });

  const shell = initShell({
    slug: 'sandpaper-letters',
    intro: 'Trace the letter with your finger. Start at the green dot.',
    done: 'You traced every letter.',
    demo: () => {
      if (letterDone) return;
      const m = letterG.getCTM();
      if (!m) return;
      const toBoard = (p: Pt) => {
        const q = new DOMPoint(p.x, p.y).matrixTransform(m);
        return { x: q.x, y: q.y };
      };
      if (dotActive) return showTrace(svg, [toBoard(LETTERS[index].dot!), toBoard(LETTERS[index].dot!)]);
      const pts = strokes[active].cps.filter((_, k) => k % 2 === 0).map(toBoard);
      return showTrace(svg, pts);
    },
    onAgain: () => {
      traced.clear();
      chips.forEach((c) => c.classList.remove('is-traced'));
      void shell.ankur('reset');
      go(0);
    },
  });

  go(0);

  return () => {
    ac.abort();
    shell.destroy();
    board.destroy();
  };
}

onPageLoad(start);

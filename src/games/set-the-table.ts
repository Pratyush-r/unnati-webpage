// Game 1 — Set the Table (Practical Life). Each item fits only its own outline.
import { Board, place, shuffle, type Layout, type Pt } from './engine/board';
import { PlacementEngine } from './engine/interact';
import { initShell } from './engine/shell';
import { showMove } from './engine/showme';
import { settle, EASE_POP } from '../lib/motion';
import { onGamePage } from './engine/shell';
import { onPageLoad } from '../scripts/lifecycle';

// The router keeps this module loaded across navigations, so the game starts on each visit to
// its page and cleans up (listeners, observers, timers, speech, audio) when the page changes.
function start(): void | (() => void) {
  if (!onGamePage('set-the-table')) return;
  const svg = document.querySelector<SVGSVGElement>('[data-board-svg]')!;
  const board = new Board(svg);

  const ITEMS = [
    { id: 'plate', label: 'steel plate', target: 'plate shape', r: 95 },
    { id: 'katori', label: 'katori bowl', target: 'katori shape', r: 70 },
    { id: 'tumbler', label: 'tumbler', target: 'tumbler shape', r: 70 },
    { id: 'spoon', label: 'spoon', target: 'spoon shape', r: 70 },
    { id: 'napkin', label: 'napkin', target: 'napkin shape', r: 70 },
  ];

  // Positions in viewBox units, per layout. Placemat offsets match a Montessori placemat:
  // plate centre, katori top-left, tumbler top-right, spoon right, napkin left.
  const MAT_OFFSETS: Record<string, Pt> = {
    plate: { x: 0, y: 10 },
    katori: { x: -150, y: -140 },
    tumbler: { x: 150, y: -140 },
    spoon: { x: 168, y: 50 },
    napkin: { x: -172, y: 50 },
  };
  const L: Record<Layout, { table: Pt; mat: Pt; tray: Pt; vase: Pt; slots: Pt[] }> = {
    landscape: {
      table: { x: 400, y: 405 },
      mat: { x: 400, y: 405 },
      tray: { x: 980, y: 405 },
      vase: { x: 690, y: 150 },
      slots: [{ x: 885, y: 190 }, { x: 1075, y: 190 }, { x: 885, y: 420 }, { x: 1075, y: 420 }, { x: 980, y: 640 }],
    },
    portrait: {
      table: { x: 400, y: 380 },
      mat: { x: 400, y: 390 },
      tray: { x: 400, y: 955 },
      vase: { x: 705, y: 175 },
      slots: [{ x: 160, y: 850 }, { x: 400, y: 850 }, { x: 640, y: 850 }, { x: 280, y: 1060 }, { x: 520, y: 1060 }],
    },
  };

  const engine = new PlacementEngine(board, {
    canPlace: (p, t) => p.id === t.id,
    onPlaced: () => {
      if ([...engine.pieces.values()].every((p) => p.target)) finish();
    },
  });

  ITEMS.forEach((it) => {
    engine.addTarget(it.id, svg.querySelector<SVGGElement>(`[data-t="${it.id}"]`)!, it.target, it.r);
    engine.addPiece(it.id, svg.querySelector<SVGGElement>(`[data-p="${it.id}"]`)!, it.label);
  });

  const vase = svg.querySelector<SVGGElement>('[data-static="vase"]')!;
  let order = shuffle(ITEMS.map((i) => i.id));

  function layoutAll(l: Layout): void {
    const c = L[l];
    place(svg.querySelector('[data-static="table"]')!, c.table);
    place(svg.querySelector('[data-static="mat"]')!, c.mat);
    place(svg.querySelector('[data-static="tray-l"]')!, L.landscape.tray);
    place(svg.querySelector('[data-static="tray-p"]')!, L.portrait.tray);
    place(vase, c.vase);
    ITEMS.forEach((it) => {
      const o = MAT_OFFSETS[it.id];
      engine.targets.get(it.id)!.pos = { x: c.mat.x + o.x, y: c.mat.y + o.y };
      engine.pieces.get(it.id)!.home = c.slots[order.indexOf(it.id)];
    });
    engine.relayout();
  }
  board.onLayout(layoutAll);

  const shell = initShell({
    slug: 'set-the-table',
    intro: "Let's set the table. Put each thing on its shape.",
    done: 'The table is ready.',
    demo: () => {
      const p = [...engine.pieces.values()].find((x) => !x.target);
      if (!p) return;
      return showMove(svg, p.home, engine.targets.get(p.id)!.pos, p.el.querySelector('.lift'));
    },
    onAgain: () => {
      order = shuffle(ITEMS.map((i) => i.id));
      svg.classList.remove('is-set');
      vase.setAttribute('opacity', '0');
      vase.querySelector<SVGGElement>('.vase-art')!.removeAttribute('style');
      engine.reset();
      layoutAll(board.layout);
      engine.pieces.get(order[0])?.el.focus({ preventScroll: true });
    },
  });

  function finish(): void {
    svg.classList.add('is-set');
    vase.setAttribute('opacity', '1');
    void settle(vase.querySelector('.vase-art'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 500, easing: EASE_POP });
    shell.complete();
  }

  return () => {
    engine.destroy();
    shell.destroy();
    board.destroy();
  };
}

onPageLoad(start);

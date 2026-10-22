// Game 2 — Knobbed Cylinders (Sensorial). The real material's control of error:
// a cylinder goes into any empty hole the same size or larger; too big bounces back; in a larger
// hole it sits loose (gap ring + 4° tilt). Complete only when every cylinder is in its exact hole.
import { Board, place, shuffle, type Layout, type Pt } from './engine/board';
import { PlacementEngine, type Piece, type Target } from './engine/interact';
import { initShell } from './engine/shell';
import { showMove } from './engine/showme';
import { animate } from '../lib/motion';

const svg = document.querySelector<SVGSVGElement>('[data-board-svg]')!;
const board = new Board(svg);

const SIZES = [110, 140, 170, 200, 230];
const NAMES = ['smallest', 'small', 'middle', 'big', 'biggest'];
const HOLE_OFFSETS = [-450, -285, -90, 135, 390]; // centre of each hole along the block

const L: Record<Layout, { block: Pt; mat: Pt; along: 'x' | 'y'; slots: Pt[] }> = {
  landscape: {
    block: { x: 600, y: 200 },
    mat: { x: 600, y: 585 },
    along: 'x',
    slots: [{ x: 170, y: 600 }, { x: 395, y: 560 }, { x: 620, y: 615 }, { x: 845, y: 560 }, { x: 1070, y: 605 }],
  },
  portrait: {
    block: { x: 170, y: 600 },
    mat: { x: 550, y: 600 },
    along: 'y',
    slots: [{ x: 450, y: 200 }, { x: 650, y: 335 }, { x: 460, y: 565 }, { x: 650, y: 765 }, { x: 495, y: 985 }],
  },
};

const sizeOf = (x: Piece | Target) => SIZES[+x.id];
const isExact = (p: Piece) => p.target !== null && p.target === p.id;

const engine = new PlacementEngine(board, {
  liftPlaced: true,
  canPlace: (p, t) => SIZES[+t.id] >= sizeOf(p),
  placement: (p, t) => {
    if (t.id === p.id) return { pos: t.pos };
    const gap = (SIZES[+t.id] - sizeOf(p)) / 2;
    return { pos: { x: t.pos.x + gap * 0.55, y: t.pos.y + gap * 0.55 }, rotate: 4 };
  },
  onPlaced: () => afterMove(),
  onLifted: () => afterMove(),
});

SIZES.forEach((d, i) => {
  engine.addTarget(String(i), svg.querySelector<SVGGElement>(`[data-t="${i}"]`)!, `${NAMES[i]} hole`, d / 2 + 24);
  engine.addPiece(String(i), svg.querySelector<SVGGElement>(`[data-p="${i}"]`)!, `${NAMES[i]} cylinder`);
});

let order = shuffle(SIZES.map((_, i) => String(i)));
let spokenStuck = false;
let stuckTimer = 0;
let finished = false;

function layoutAll(l: Layout): void {
  const c = L[l];
  place(svg.querySelector('[data-static="block"]')!, c.block);
  place(svg.querySelector('[data-static="mat"]')!, c.mat);
  SIZES.forEach((_, i) => {
    const off = HOLE_OFFSETS[i];
    engine.targets.get(String(i))!.pos = c.along === 'x' ? { x: c.block.x + off, y: c.block.y } : { x: c.block.x, y: c.block.y + off };
    engine.pieces.get(String(i))!.home = c.slots[order.indexOf(String(i))];
  });
  engine.relayout();
}
board.onLayout(layoutAll);

function afterMove(): void {
  window.clearTimeout(stuckTimer);
  const pieces = [...engine.pieces.values()];
  if (pieces.every(isExact)) {
    finish();
    return;
  }
  // Stuck: a cylinder fits no empty hole → after 1.5 s the loose cylinders wiggle once.
  const empty = [...engine.targets.values()].filter((t) => !t.occupant);
  const stuck = pieces.some((p) => !p.target && !empty.some((t) => SIZES[+t.id] >= sizeOf(p)));
  if (!stuck) return;
  stuckTimer = window.setTimeout(() => {
    pieces
      .filter((p) => p.target && !isExact(p))
      .forEach((p) => animate(p.el.querySelector('.lift'), [
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' },
      ], { duration: 500, easing: 'ease-in-out' }));
    if (!spokenStuck) {
      spokenStuck = true;
      void shell.say("One doesn't fit. Can you find the loose one?");
    }
  }, 1500);
}

function finish(): void {
  if (finished) return;
  finished = true;
  // Knobs bob one after another, smallest to largest.
  SIZES.forEach((_, i) => {
    animate(engine.pieces.get(String(i))!.el.querySelector('.knob'), [
      { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' },
    ], { duration: 360, delay: i * 140, easing: 'ease-in-out' });
  });
  engine.pieces.forEach((p) => engine.lock(p));
  shell.complete();
}

const shell = initShell({
  slug: 'knobbed-cylinders',
  intro: "Find each cylinder's home.",
  done: 'Every cylinder is home.',
  demo: () => {
    const p = [...engine.pieces.values()].find((x) => !isExact(x) && !engine.targets.get(x.id)!.occupant);
    if (!p) return;
    const from = p.target ? engine.targets.get(p.target)!.pos : p.home;
    return showMove(svg, from, engine.targets.get(p.id)!.pos, p.el.querySelector('.lift'));
  },
  onAgain: () => {
    order = shuffle(SIZES.map((_, i) => String(i)));
    spokenStuck = false;
    finished = false;
    engine.reset();
    layoutAll(board.layout);
    engine.pieces.get(order[0])?.el.focus({ preventScroll: true });
  },
});

// Game 5 — Land, Air & Water (Cultural Studies). Nine picture cards, one at a time from a deck.
// A card fits only its own tray; when it settles it makes one tiny cartoon move (600 ms).
import { Board, place, shuffle, type Layout, type Pt } from './engine/board';
import { PlacementEngine, type Piece, type Target } from './engine/interact';
import { initShell } from './engine/shell';
import { showMove } from './engine/showme';
import { speak } from './engine/speech';
import { animate, settle, wait, EASE_POP } from '../lib/motion';

const svg = document.querySelector<SVGSVGElement>('[data-board-svg]')!;
const board = new Board(svg);
const deck = svg.querySelector<SVGGElement>('[data-static="deck"]')!;
const TRAYS = ['land', 'water', 'air'] as const;
const TRAY_LABELS = { land: 'Land tray', water: 'Water tray', air: 'Air tray' };
const SPOKEN: Record<string, string> = {
  elephant: 'elephant', cow: 'cow', auto: 'auto-rickshaw', fish: 'fish', dolphin: 'dolphin',
  boat: 'fishing boat', parrot: 'parrot', plane: 'aeroplane', kite: 'kite',
};
const MOVES: Record<string, Keyframe[]> = {
  trunk: [{ transform: 'rotate(0)' }, { transform: 'rotate(-28deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0)' }],
  tail: [{ transform: 'rotate(0)' }, { transform: 'rotate(-30deg)' }, { transform: 'rotate(20deg)' }, { transform: 'rotate(0)' }],
  wobble: [{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }],
  wiggle: [{ transform: 'skewY(0) rotate(0)' }, { transform: 'skewY(8deg) rotate(-4deg)' }, { transform: 'skewY(-8deg) rotate(4deg)' }, { transform: 'skewY(0) rotate(0)' }],
  arc: [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-26%) rotate(-14deg)' }, { transform: 'translateY(0) rotate(0)' }],
  bob: [{ transform: 'translateY(0)' }, { transform: 'translateY(-8%)' }, { transform: 'translateY(4%)' }, { transform: 'translateY(0)' }],
  flap: [{ transform: 'rotate(0)' }, { transform: 'rotate(-40deg)' }, { transform: 'rotate(0)' }, { transform: 'rotate(-30deg)' }, { transform: 'rotate(0)' }],
  glide: [{ transform: 'translate(0, 0) rotate(0)' }, { transform: 'translate(14%, -10%) rotate(-6deg)' }, { transform: 'translate(0, 0) rotate(0)' }],
  flutter: [{ transform: 'rotate(0)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }],
};

const L: Record<Layout, { deck: Pt; trays: Record<string, Pt>; slots: Pt[]; slotScale: number }> = {
  landscape: {
    deck: { x: 600, y: 215 },
    trays: { land: { x: 210, y: 590 }, water: { x: 600, y: 590 }, air: { x: 990, y: 590 } },
    slots: [{ x: -100, y: 42 }, { x: 0, y: 42 }, { x: 100, y: 42 }],
    slotScale: 0.42,
  },
  portrait: {
    deck: { x: 400, y: 230 },
    trays: { land: { x: 400, y: 530 }, water: { x: 400, y: 775 }, air: { x: 400, y: 1020 } },
    slots: [{ x: -110, y: 0 }, { x: 50, y: 0 }, { x: 210, y: 0 }],
    slotScale: 0.66,
  },
};

const trayOrder: Record<string, string[]> = { land: [], water: [], air: [] };
let order: string[] = [];
let current = 0;

const engine: PlacementEngine = new PlacementEngine(board, {
  canPlace: (p, t) => p.el.dataset.home === t.id,
  placement: (p, t) => {
    const list = trayOrder[t.id];
    if (!list.includes(p.id)) list.push(p.id);
    const s = L[board.layout].slots[list.indexOf(p.id)];
    return { pos: { x: t.pos.x + s.x, y: t.pos.y + s.y }, scale: L[board.layout].slotScale };
  },
  candidates: (): Target[] => [...engine.targets.values()],
  onPlaced: (p, t) => {
    t.occupant = null; // trays hold many cards
    const anim = p.el.querySelector<SVGGElement>('.anim');
    if (anim) animate(anim, MOVES[anim.dataset.move!], { duration: 600, easing: 'ease-in-out' });
    void next();
  },
});

TRAYS.forEach((id) => engine.addTarget(id, svg.querySelector<SVGGElement>(`[data-t="${id}"]`)!, TRAY_LABELS[id], 210));
svg.querySelectorAll<SVGGElement>('[data-p]').forEach((el) => engine.addPiece(el.dataset.p!, el, `picture of ${/^[aeiou]/.test(el.dataset.label!) ? 'an' : 'a'} ${el.dataset.label}`));

function layoutAll(l: Layout): void {
  const c = L[l];
  place(deck, c.deck);
  TRAYS.forEach((t) => (engine.targets.get(t)!.pos = c.trays[t]));
  engine.pieces.forEach((p) => (p.home = c.deck));
  engine.relayout();
}
board.onLayout(layoutAll);

function show(i: number): void {
  const p = engine.pieces.get(order[i]);
  if (!p) return;
  p.el.classList.remove('is-waiting');
  p.el.parentNode?.appendChild(p.el);
  void settle(p.el.querySelector('.lift'), [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: EASE_POP }).then(() =>
    p.el.querySelector<SVGGElement>('.lift')?.removeAttribute('style'),
  );
}

async function next(): Promise<void> {
  current++;
  if (current >= order.length) {
    deck.style.opacity = '0';
    await wait(650);
    shell.complete();
    return;
  }
  if (current === order.length - 1) deck.style.opacity = '0';
  await wait(650);
  show(current);
  void speak(SPOKEN[order[current]]);
  engine.pieces.get(order[current])!.el.focus({ preventScroll: true });
}

function newRound(): void {
  order = shuffle([...engine.pieces.keys()]);
  current = 0;
  TRAYS.forEach((t) => (trayOrder[t].length = 0));
  engine.pieces.forEach((p: Piece) => p.el.classList.add('is-waiting'));
  deck.style.opacity = '1';
  engine.reset();
  layoutAll(board.layout);
  show(0);
}
newRound();

const shell = initShell({
  slug: 'land-air-water',
  intro: `Where does it live or travel — on land, in water, or in the air? ${SPOKEN[order[0]]}.`,
  done: 'Everything has found its place.',
  demo: () => {
    const p = engine.pieces.get(order[current]);
    if (!p || p.target) return;
    return showMove(svg, p.home, engine.targets.get(p.el.dataset.home!)!.pos, p.el.querySelector('.lift'));
  },
  onAgain: () => {
    newRound();
    engine.pieces.get(order[0])!.el.focus({ preventScroll: true });
    void speak(SPOKEN[order[0]]);
  },
});

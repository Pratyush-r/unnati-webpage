// Placement engine shared by the drag-and-place games.
// Pointer drag (with pointer capture), tap-to-pick / tap-to-place, and full keyboard play:
// Tab cycles pieces · Enter/Space picks up · Tab/arrows cycle targets · Enter/Space places · Esc cancels.
// The material shows the mistake: a refused move glides back while the target gives one small shimmy.
import { Board, dist, glide, place, shimmy, type Pt } from './board';
import { announce } from './announce';
import { tok, unlockAudio } from './audio';

export type Piece = {
  id: string;
  el: SVGGElement;
  label: string;
  home: Pt;
  target: string | null;
  locked: boolean;
};
export type Target = {
  id: string;
  el: SVGGElement;
  label: string;
  pos: Pt;
  r: number;
  occupant: string | null;
};
export type Placement = { pos: Pt; rotate?: number; scale?: number };

export type Rules = {
  canPlace(piece: Piece, target: Target): boolean;
  /** Where a placed piece sits (default: target centre). */
  placement?(piece: Piece, target: Target): Placement;
  /** Can a placed piece be lifted out again? */
  liftPlaced?: boolean;
  /** Restricted set of targets offered while a piece is held (default: empty ones). */
  candidates?(piece: Piece): Target[];
  onPlaced?(piece: Piece, target: Target): void;
  onLifted?(piece: Piece, from: Target): void;
  onRefused?(piece: Piece, target: Target): void;
  homeScale?: number;
};

const DRAG_THRESHOLD = 8;
const DEFAULT_SNAP = 70;

export class PlacementEngine {
  readonly pieces = new Map<string, Piece>();
  readonly targets = new Map<string, Target>();
  private held: Piece | null = null;
  private heldByKeyboard = false;
  private drag: { piece: Piece; pointerId: number; start: Pt; offset: Pt; moved: boolean; fromTarget: Target | null } | null = null;
  private busy = false;

  constructor(private board: Board, private rules: Rules) {
    const svg = board.svg;
    svg.addEventListener('pointerdown', this.onDown);
    svg.addEventListener('pointermove', this.onMove);
    svg.addEventListener('pointerup', this.onUp);
    svg.addEventListener('pointercancel', this.onCancel);
    svg.addEventListener('keydown', this.onKey);
  }

  addPiece(id: string, el: SVGGElement, label: string): Piece {
    const p: Piece = { id, el, label, home: { x: 0, y: 0 }, target: null, locked: false };
    el.classList.add('piece');
    el.dataset.piece = id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label);
    this.pieces.set(id, p);
    return p;
  }

  addTarget(id: string, el: SVGGElement, label: string, r = DEFAULT_SNAP): Target {
    const t: Target = { id, el, label, pos: { x: 0, y: 0 }, r, occupant: null };
    el.classList.add('target');
    el.dataset.target = id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-label', label);
    this.targets.set(id, t);
    return t;
  }

  /** Re-apply positions instantly (after a layout switch or a reset). */
  relayout(): void {
    this.targets.forEach((t) => place(t.el, t.pos));
    this.pieces.forEach((p) => {
      if (p.target) {
        const pl = this.placementFor(p, this.targets.get(p.target)!);
        place(p.el, pl.pos, pl.rotate, pl.scale);
      } else {
        place(p.el, p.home, 0, this.rules.homeScale ?? 1);
      }
    });
  }

  reset(): void {
    this.cancelHold();
    this.pieces.forEach((p) => {
      p.target = null;
      p.locked = false;
      p.el.classList.remove('is-placed', 'is-locked');
      p.el.setAttribute('tabindex', '0');
      p.el.removeAttribute('aria-disabled');
    });
    this.targets.forEach((t) => (t.occupant = null));
    this.relayout();
  }

  lock(piece: Piece): void {
    piece.locked = true;
    piece.el.classList.add('is-locked');
    piece.el.setAttribute('tabindex', '-1');
    piece.el.setAttribute('aria-disabled', 'true');
  }

  get isHolding(): boolean {
    return !!this.held;
  }

  private placementFor(p: Piece, t: Target): Placement {
    return this.rules.placement?.(p, t) ?? { pos: t.pos };
  }

  private candidates(p: Piece): Target[] {
    return this.rules.candidates?.(p) ?? [...this.targets.values()].filter((t) => !t.occupant || t.occupant === p.id);
  }

  private currentPos(p: Piece): Pt {
    if (p.target) return this.placementFor(p, this.targets.get(p.target)!).pos;
    return p.home;
  }

  // ——— holding / selection ———
  private hold(p: Piece, byKeyboard: boolean): void {
    if (this.held && this.held !== p) this.release(false);
    this.held = p;
    this.heldByKeyboard = byKeyboard;
    p.el.classList.add('is-held');
    p.el.setAttribute('aria-pressed', 'true');
    this.board.svg.classList.add('is-holding');
    this.pieces.forEach((o) => o !== p && o.el.setAttribute('tabindex', '-1'));
    const cands = this.candidates(p);
    cands.forEach((t) => {
      t.el.classList.add('is-candidate');
      t.el.setAttribute('tabindex', '0');
    });
    announce(`Picked up the ${p.label}`);
    if (byKeyboard) cands[0]?.el.focus();
  }

  private release(refocus: boolean): void {
    const p = this.held;
    if (!p) return;
    p.el.classList.remove('is-held');
    p.el.removeAttribute('aria-pressed');
    this.board.svg.classList.remove('is-holding');
    this.targets.forEach((t) => {
      t.el.classList.remove('is-candidate');
      t.el.setAttribute('tabindex', '-1');
    });
    this.held = null;
    this.pieces.forEach((o) => o.el.setAttribute('tabindex', o.locked ? '-1' : '0'));
    if (refocus && !p.locked) p.el.focus();
  }

  cancelHold(): void {
    this.release(this.heldByKeyboard);
  }

  /** Try to put piece on target. Returns true when placed. */
  async attempt(p: Piece, t: Target, from: Pt, fromScale = 1): Promise<boolean> {
    if (this.busy) return false;
    const byKeyboard = this.heldByKeyboard;
    const fromTarget = p.target ? this.targets.get(p.target)! : null;
    const occupiedByOther = t.occupant && t.occupant !== p.id;
    this.release(false);
    if (occupiedByOther || !this.rules.canPlace(p, t)) {
      this.busy = true;
      shimmy(t.el.querySelector('.shim') ?? t.el);
      announce("Doesn't fit");
      this.rules.onRefused?.(p, t);
      const back = fromTarget ? this.placementFor(p, fromTarget) : { pos: p.home, rotate: 0, scale: this.rules.homeScale ?? 1 };
      await glide(p.el, from, back.pos, { rotate: back.rotate, scale: back.scale, fromScale });
      this.busy = false;
      if (byKeyboard) p.el.focus();
      return false;
    }
    if (fromTarget && fromTarget !== t) {
      fromTarget.occupant = null;
      this.rules.onLifted?.(p, fromTarget);
    }
    p.target = t.id;
    t.occupant = p.id;
    p.el.classList.add('is-placed');
    const pl = this.placementFor(p, t);
    tok();
    announce('Placed');
    this.busy = true;
    await glide(p.el, from, pl.pos, { rotate: pl.rotate, scale: pl.scale, fromScale, duration: 220 });
    this.busy = false;
    if (!this.rules.liftPlaced) this.lock(p);
    this.rules.onPlaced?.(p, t);
    if (byKeyboard) this.focusNext(p);
    return true;
  }

  /** Lift a placed piece back to its home spot (used by tap on a placed piece with nowhere to go). */
  async sendHome(p: Piece): Promise<void> {
    const from = this.currentPos(p);
    if (p.target) {
      const t = this.targets.get(p.target)!;
      t.occupant = null;
      p.target = null;
      p.el.classList.remove('is-placed');
      this.rules.onLifted?.(p, t);
    }
    await glide(p.el, from, p.home, { scale: this.rules.homeScale ?? 1 });
  }

  private focusNext(after: Piece): void {
    const list = [...this.pieces.values()].filter((p) => !p.locked && !p.target);
    const next = list[0] ?? [...this.pieces.values()].find((p) => !p.locked && p !== after);
    (next ?? after).el.focus();
  }

  private nearestTarget(pt: Pt, _p: Piece): Target | null {
    let best: Target | null = null;
    let bestD = Infinity;
    this.targets.forEach((t) => {
      const d = dist(pt, t.pos);
      if (d < t.r && d < bestD) {
        best = t;
        bestD = d;
      }
    });
    return best;
  }

  // ——— pointer ———
  private onDown = (e: PointerEvent) => {
    unlockAudio();
    if (this.busy || e.button > 0) return;
    const el = (e.target as Element).closest<SVGGElement>('[data-piece]');
    if (!el) return;
    const p = this.pieces.get(el.dataset.piece!)!;
    if (p.locked) return;
    e.preventDefault();
    const pt = this.board.toSvg(e.clientX, e.clientY);
    const at = this.currentPos(p);
    this.drag = {
      piece: p,
      pointerId: e.pointerId,
      start: pt,
      offset: { x: at.x - pt.x, y: at.y - pt.y },
      moved: false,
      fromTarget: p.target ? this.targets.get(p.target)! : null,
    };
    try {
      this.board.svg.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  private onMove = (e: PointerEvent) => {
    const d = this.drag;
    if (!d || e.pointerId !== d.pointerId) return;
    const pt = this.board.toSvg(e.clientX, e.clientY);
    if (!d.moved && dist(pt, d.start) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      if (this.held !== d.piece) this.hold(d.piece, false);
      d.piece.el.classList.add('is-dragging');
      d.piece.el.parentNode?.appendChild(d.piece.el); // bring to front
    }
    place(d.piece.el, { x: pt.x + d.offset.x, y: pt.y + d.offset.y });
  };

  private onUp = (e: PointerEvent) => {
    const d = this.drag;
    const pt = this.board.toSvg(e.clientX, e.clientY);
    if (d && e.pointerId === d.pointerId) {
      this.drag = null;
      d.piece.el.classList.remove('is-dragging');
      if (d.moved) {
        const centre = { x: pt.x + d.offset.x, y: pt.y + d.offset.y };
        const t = this.nearestTarget(centre, d.piece);
        if (t) {
          void this.attempt(d.piece, t, centre);
        } else {
          this.release(false);
          const back = d.fromTarget ? this.placementFor(d.piece, d.fromTarget) : { pos: d.piece.home, rotate: 0, scale: this.rules.homeScale ?? 1 };
          void glide(d.piece.el, centre, back.pos, { rotate: back.rotate, scale: back.scale });
        }
        return;
      }
      // A tap on a piece: toggle selection (tap-to-pick).
      if (this.held === d.piece) this.release(false);
      else this.hold(d.piece, false);
      return;
    }
    // A tap elsewhere while holding: place on a tapped target, otherwise put the piece down.
    if (this.held && !this.busy) {
      const tEl = (e.target as Element).closest<SVGGElement>('[data-target]');
      const t = tEl ? this.targets.get(tEl.dataset.target!)! : this.nearestTarget(pt, this.held);
      if (t) void this.attempt(this.held, t, this.currentPos(this.held));
      else this.release(false);
    }
  };

  private onCancel = () => {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    d.piece.el.classList.remove('is-dragging');
    this.release(false);
    const back = d.fromTarget ? this.placementFor(d.piece, d.fromTarget) : { pos: d.piece.home };
    place(d.piece.el, back.pos, (back as Placement).rotate ?? 0, (back as Placement).scale ?? this.rules.homeScale ?? 1);
  };

  // ——— keyboard ———
  private onKey = (e: KeyboardEvent) => {
    const el = e.target as Element;
    const pieceEl = el.closest<SVGGElement>('[data-piece]');
    const targetEl = el.closest<SVGGElement>('[data-target]');
    if (e.key === 'Escape' && this.held) {
      e.preventDefault();
      this.heldByKeyboard = true;
      announce('Put back');
      this.cancelHold();
      return;
    }
    const activate = e.key === 'Enter' || e.key === ' ';
    if (pieceEl && activate) {
      e.preventDefault();
      unlockAudio();
      const p = this.pieces.get(pieceEl.dataset.piece!)!;
      if (p.locked || this.busy) return;
      if (this.held === p) this.cancelHold();
      else this.hold(p, true);
      return;
    }
    if (targetEl && this.held) {
      const cands = this.candidates(this.held).map((t) => t.el);
      const i = cands.indexOf(targetEl);
      if (activate) {
        e.preventDefault();
        const t = this.targets.get(targetEl.dataset.target!)!;
        this.heldByKeyboard = true;
        void this.attempt(this.held, t, this.currentPos(this.held));
      } else if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        cands[(i + 1) % cands.length]?.focus();
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        cands[(i - 1 + cands.length) % cands.length]?.focus();
      }
    }
  };
}

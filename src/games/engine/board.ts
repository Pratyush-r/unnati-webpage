// Responsive game board: one SVG, two layouts.
// Landscape (viewBox 1200×800) when the board is at least as wide as it is tall, portrait (800×1200) otherwise.
import { animate, done, EASE_MOVE } from '../../lib/motion';

export type Layout = 'landscape' | 'portrait';
export type Pt = { x: number; y: number };

export class Board {
  readonly svg: SVGSVGElement;
  layout: Layout = 'landscape';
  private listeners: ((l: Layout) => void)[] = [];

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    const host = svg.parentElement!;
    const apply = () => {
      const r = host.getBoundingClientRect();
      const next: Layout = r.width >= r.height ? 'landscape' : 'portrait';
      if (next !== this.layout || !svg.getAttribute('viewBox')) {
        this.layout = next;
        svg.setAttribute('viewBox', next === 'landscape' ? '0 0 1200 800' : '0 0 800 1200');
        svg.dataset.layout = next;
        this.listeners.forEach((fn) => fn(next));
      }
    };
    new ResizeObserver(apply).observe(host);
    apply();
  }

  onLayout(fn: (l: Layout) => void): void {
    this.listeners.push(fn);
    fn(this.layout);
  }

  /** Client (CSS px) → viewBox units. */
  toSvg(clientX: number, clientY: number): Pt {
    const m = this.svg.getScreenCTM();
    if (!m) return { x: clientX, y: clientY };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
}

/** Position helpers. Pieces are drawn centred on (0,0) and moved with a CSS transform in viewBox units. */
export function tf(p: Pt, rotate = 0, scale = 1): string {
  return `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${rotate}deg) scale(${scale})`;
}

export function place(el: Element, p: Pt, rotate = 0, scale = 1): void {
  (el as SVGGraphicsElement).style.transform = tf(p, rotate, scale);
}

/** Glide from one spot to another (350 ms) and settle there. */
export function glide(el: Element, from: Pt, to: Pt, opts: { rotate?: number; scale?: number; fromScale?: number; duration?: number } = {}): Promise<void> {
  const { rotate = 0, scale = 1, fromScale = scale, duration = 350 } = opts;
  place(el, to, rotate, scale);
  return done(animate(el, [{ transform: tf(from, 0, fromScale) }, { transform: tf(to, rotate, scale) }], { duration, easing: EASE_MOVE }));
}

/** The target gives one small shimmy (±3°, 300 ms). */
export function shimmy(el: Element | null): void {
  animate(el, [
    { transform: 'rotate(0deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0deg)' },
  ], { duration: 300, easing: 'ease-in-out' });
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// "Show me" — a Montessori presentation. A translucent hand slowly demonstrates the first correct
// move (1.6 s) and returns. Under reduced motion the hand and a ghost simply appear at the target.
import { animate, done, reducedMotion } from '../../lib/motion';
import { tf, type Pt } from './board';

function layer(svg: SVGSVGElement): { hand: SVGGElement; ghost: SVGGElement } {
  const hand = svg.querySelector<SVGGElement>('[data-hand]')!;
  const ghost = svg.querySelector<SVGGElement>('[data-ghost]')!;
  svg.appendChild(ghost); // always on top
  svg.appendChild(hand);
  return { hand, ghost };
}

let running = false;

/** Carry a ghost of `source` from → to. */
export async function showMove(svg: SVGSVGElement, from: Pt, to: Pt, source?: Element | null, ghostScale = 1): Promise<void> {
  if (running) return;
  running = true;
  const { hand, ghost } = layer(svg);
  ghost.replaceChildren();
  if (source) {
    const clone = source.cloneNode(true) as SVGGElement;
    clone.removeAttribute('style');
    clone.removeAttribute('class');
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    clone.removeAttribute('aria-label');
    clone.removeAttribute('data-piece');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clone.querySelectorAll('.hit').forEach((n) => n.remove());
    ghost.appendChild(clone);
  }
  ghost.style.opacity = '0.55';
  hand.style.opacity = '1';
  const handTo = { x: to.x + 10, y: to.y + 12 };
  const handFrom = { x: from.x + 10, y: from.y + 12 };

  if (reducedMotion()) {
    ghost.style.transform = tf(to, 0, ghostScale);
    hand.style.transform = tf(handTo);
    await new Promise((r) => setTimeout(r, 1600));
  } else {
    const opts = { duration: 1600, easing: 'ease-in-out' };
    const g = animate(ghost, [
      { transform: tf(from, 0, ghostScale), opacity: 0 },
      { transform: tf(from, 0, ghostScale), opacity: 0.55, offset: 0.15 },
      { transform: tf(to, 0, ghostScale), opacity: 0.55, offset: 0.75 },
      { transform: tf(to, 0, ghostScale), opacity: 0 },
    ], opts);
    animate(hand, [
      { transform: tf(handFrom), opacity: 0 },
      { transform: tf(handFrom), opacity: 0.85, offset: 0.15 },
      { transform: tf(handTo), opacity: 0.85, offset: 0.75 },
      { transform: tf(handTo), opacity: 0.85, offset: 0.85 },
      { transform: tf(handFrom), opacity: 0 },
    ], opts);
    await done(g);
  }
  ghost.style.opacity = '0';
  hand.style.opacity = '0';
  ghost.replaceChildren();
  running = false;
}

/** Trace along a list of points (Sandpaper Letters: two fingers, as in the classroom). */
export async function showTrace(svg: SVGSVGElement, points: Pt[], duration = 1600): Promise<void> {
  if (running || points.length < 2) return;
  running = true;
  const { hand } = layer(svg);
  hand.classList.add('two-fingers');
  const at = (p: Pt) => tf({ x: p.x, y: p.y });
  hand.style.opacity = '0.85';
  if (reducedMotion()) {
    hand.style.transform = at(points[0]);
    await new Promise((r) => setTimeout(r, duration));
  } else {
    const frames: Keyframe[] = points.map((p, i) => ({ transform: at(p), offset: 0.1 + (0.8 * i) / (points.length - 1) }));
    await done(animate(hand, [{ transform: at(points[0]), opacity: 0, offset: 0 }, ...frames.map((f) => ({ ...f, opacity: 0.85 })), { transform: at(points[points.length - 1]), opacity: 0 }], { duration, easing: 'linear' }));
  }
  hand.style.opacity = '0';
  hand.classList.remove('two-fingers');
  running = false;
}

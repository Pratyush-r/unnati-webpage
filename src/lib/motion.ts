// Motion helpers. Every animation goes through animate() so reduced motion is honoured in one place.
export const EASE_MOVE = 'cubic-bezier(.2,.8,.2,1)';
export const EASE_POP = 'cubic-bezier(.34,1.56,.64,1)';

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function reducedMotion(): boolean {
  return !!query?.matches;
}

/** Web Animations API wrapper. Returns null (and does nothing) under reduced motion. */
export function animate(
  el: Element | null | undefined,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
): Animation | null {
  if (!el || reducedMotion() || typeof (el as HTMLElement).animate !== 'function') return null;
  return (el as HTMLElement).animate(keyframes, { easing: EASE_MOVE, ...options });
}

/** Resolves when the animation ends (or immediately when there is none). */
export function done(anim: Animation | null): Promise<void> {
  if (!anim) return Promise.resolve();
  return anim.finished.then(
    () => undefined,
    () => undefined,
  );
}

/** Run a callback once when the element first enters the viewport. Returns a cleanup. */
export function onceInView(el: Element, cb: () => void, threshold = 0.35): () => void {
  if (!('IntersectionObserver' in window)) {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Animate to an end state that persists. The final keyframe is committed to inline style and the
 * animation is cancelled, so no finished animation lingers. Under reduced motion the end state is
 * applied instantly.
 */
export function settle(el: Element | null | undefined, keyframes: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
  if (!el) return Promise.resolve();
  const last = keyframes[keyframes.length - 1];
  const apply = () => {
    const style = (el as HTMLElement).style;
    for (const [k, v] of Object.entries(last)) {
      if (k === 'offset' || k === 'easing' || k === 'composite') continue;
      style.setProperty(k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), String(v));
    }
  };
  const anim = animate(el, keyframes, options);
  if (!anim) {
    apply();
    return Promise.resolve();
  }
  return done(anim).then(() => {
    apply();
    anim.cancel();
  });
}

export const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, reducedMotion() ? 0 : ms));

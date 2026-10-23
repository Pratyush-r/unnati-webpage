// Ankur's states (brief 4.5). Each answers something the visitor did; only the blink plays by itself.
import { animate, done, reducedMotion, EASE_POP } from '../lib/motion';

export type AnkurState = 'blink' | 'wave' | 'nod' | 'tilt' | 'peek' | 'hop' | 'grow' | 'look-around' | 'travel' | 'land' | 'point' | 'hide' | 'return' | 'reset';

/** Options for `point`: the direction of the target in degrees (0 = right, -90 = up). */
export type PlayOptions = { angle?: number };

// The right leaf rests pointing slightly up-right.
const LEAF_REST_DEG = -16;

const part = (root: Element, name: string) => root.querySelector(`.ankur-${name}`);

export function play(root: Element | null, state: AnkurState, opts: PlayOptions = {}): Promise<void> {
  if (!root) return Promise.resolve();
  switch (state) {
    case 'blink':
      return done(animate(part(root, 'eyes'), [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 160 }));
    case 'wave':
      return done(
        animate(
          part(root, 'leaf-r'),
          [0, 18, -18, 18, -18, 18, 0].map((d) => ({ transform: `rotate(${d}deg)` })),
          { duration: 900, easing: 'ease-in-out' },
        ),
      );
    case 'nod':
      return done(animate(part(root, 'body'), [{ transform: 'rotate(0)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 400 }));
    case 'tilt':
      return done(animate(part(root, 'body'), [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)', offset: 0.45 }, { transform: 'rotate(-8deg)', offset: 0.6 }, { transform: 'rotate(0)' }], { duration: 500 }));
    case 'peek': {
      const a = animate(root, [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 700, easing: EASE_POP });
      return done(a).then(() => play(root, 'blink'));
    }
    case 'hop':
      return done(
        animate(
          part(root, 'body'),
          [
            { transform: 'translateY(0) scale(1, 1)' },
            { transform: 'translateY(0) scale(1.06, .9)', offset: 0.1 },
            { transform: 'translateY(-16%) scale(.96, 1.05)', offset: 0.3 },
            { transform: 'translateY(0) scale(1.05, .92)', offset: 0.48 },
            { transform: 'translateY(-8%) scale(.98, 1.03)', offset: 0.68 },
            { transform: 'translateY(0) scale(1.03, .96)', offset: 0.86 },
            { transform: 'translateY(0) scale(1, 1)' },
          ],
          { duration: 900, easing: 'ease-in-out' },
        ),
      );
    case 'grow': {
      const leaf = part(root, 'new-leaf');
      const a = animate(leaf, [{ transform: 'scale(0) rotate(-30deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 700, easing: EASE_POP });
      root.classList.add('is-grown');
      return done(a);
    }
    case 'look-around': {
      const eyes = animate(
        part(root, 'eyes'),
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)', offset: 0.25 }, { transform: 'translateX(3px)', offset: 0.65 }, { transform: 'translateX(0)' }],
        { duration: 1200, iterations: 3, easing: 'ease-in-out' },
      );
      animate(part(root, 'body'), [{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)', offset: 0.25 }, { transform: 'rotate(3deg)', offset: 0.65 }, { transform: 'rotate(0)' }], { duration: 1200, iterations: 3, easing: 'ease-in-out' });
      return done(eyes);
    }
    case 'travel': {
      // Leans forward 10°, the leaves stream back 20°, one small hop (400 ms).
      animate(part(root, 'body'), [
        { transform: 'translateY(0) rotate(0)' },
        { transform: 'translateY(-10%) rotate(-10deg)', offset: 0.45 },
        { transform: 'translateY(0) rotate(-6deg)', offset: 0.8 },
        { transform: 'translateY(0) rotate(0)' },
      ], { duration: 400, easing: 'ease-in-out' });
      ['leaf-l', 'leaf-r'].forEach((l) =>
        animate(part(root, l), [{ transform: 'rotate(0)' }, { transform: 'rotate(20deg)', offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 400, easing: 'ease-in-out' }),
      );
      return wait(400);
    }
    case 'land': {
      // Small squash (scaleY .92) and recover, then a nod (350 ms).
      const body = part(root, 'body');
      return done(animate(body, [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.04, .92)' }, { transform: 'scale(1, 1)' }], { duration: 170, easing: EASE_POP })).then(() =>
        done(animate(body, [{ transform: 'rotate(0)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 180 })),
      );
    }
    case 'point': {
      // Turns toward the target; the right leaf points at it (600 ms in, 1.5 s hold, 300 ms out).
      const angle = opts.angle ?? -135;
      const turn = Math.cos((angle * Math.PI) / 180) < 0 ? -6 : 6;
      const leafTurn = Math.max(-160, Math.min(70, angle - LEAF_REST_DEG));
      const timing = { duration: 2400, easing: 'ease-in-out' };
      const at = (v: string) => [
        { transform: 'rotate(0)', offset: 0 },
        { transform: v, offset: 0.25 },
        { transform: v, offset: 0.875 },
        { transform: 'rotate(0)', offset: 1 },
      ];
      animate(part(root, 'body'), at(`rotate(${turn}deg)`), timing);
      return done(animate(part(root, 'leaf-r'), at(`rotate(${leafTurn}deg) scale(1.15)`), timing));
    }
    case 'hide': {
      // Waves, then slides down into the dock tab (500 ms).
      animate(part(root, 'leaf-r'), [0, 18, -18, 0].map((d) => ({ transform: `rotate(${d}deg)` })), { duration: 220 });
      return done(animate(root, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(0)', opacity: 1, offset: 0.44 }, { transform: 'translateY(110%)', opacity: 0 }], { duration: 500, easing: 'cubic-bezier(.4,0,1,1)' }));
    }
    case 'return': {
      // Peeks up from the dock tab, then blinks (600 ms).
      const a = animate(root, [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 440, easing: EASE_POP });
      return done(a).then(() => play(root, 'blink'));
    }
    case 'reset':
      root.classList.remove('is-grown');
      return Promise.resolve();
  }
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, reducedMotion() ? 0 : ms));

/** Blink every 6–9 s, only while Ankur is on screen. Off under reduced motion. Returns a cleanup. */
export function initBlink(root: Element): () => void {
  if (reducedMotion() || !('IntersectionObserver' in window)) return () => {};
  let timer = 0;
  let visible = false;
  const schedule = () => {
    window.clearTimeout(timer);
    if (!visible) return;
    timer = window.setTimeout(() => {
      if (visible && !document.hidden && getComputedStyle(root).visibility !== 'hidden') play(root, 'blink');
      schedule();
    }, 6000 + Math.random() * 3000);
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    schedule();
  });
  io.observe(root);
  return () => {
    io.disconnect();
    window.clearTimeout(timer);
  };
}

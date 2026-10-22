// Ankur's states (brief 4.5). Each answers something the visitor did; only the blink plays by itself.
import { animate, done, reducedMotion, EASE_POP } from '../lib/motion';

export type AnkurState = 'blink' | 'wave' | 'nod' | 'tilt' | 'peek' | 'hop' | 'grow' | 'look-around' | 'reset';

const part = (root: Element, name: string) => root.querySelector(`.ankur-${name}`);

export function play(root: Element | null, state: AnkurState): Promise<void> {
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
    case 'reset':
      root.classList.remove('is-grown');
      return Promise.resolve();
  }
}

/** Blink every 6–9 s, only while Ankur is on screen. Off under reduced motion. */
export function initBlink(root: Element): void {
  if (reducedMotion() || !('IntersectionObserver' in window)) return;
  let timer = 0;
  let visible = false;
  const schedule = () => {
    window.clearTimeout(timer);
    if (!visible) return;
    timer = window.setTimeout(() => {
      if (visible && !document.hidden) play(root, 'blink');
      schedule();
    }, 6000 + Math.random() * 3000);
  };
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    schedule();
  }).observe(root);
}

export function initAll(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('[data-ankur][data-blink]').forEach(initBlink);
}

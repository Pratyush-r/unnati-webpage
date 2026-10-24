// Navigation extras for the client router: the "sprout reveal" into Montessori at Home,
// a loading bar for slow navigations only, and focus handling after each swap.
// Loaded once (from both layouts); everything here listens to router events.
import { reducedMotion } from '../lib/motion';

type Prep = Event & { from: URL; to: URL; sourceElement?: Element };
type Swap = Event & { newDocument: Document; viewTransition?: { finished: Promise<void> } };

const root = document.documentElement;
const supportsVT = typeof document.startViewTransition === 'function';
const toAtHome = (url: URL) => url.pathname === '/at-home' || url.pathname.startsWith('/at-home/');

let sprout: { x: number; y: number; r: number } | null = null;
let clientNav = false;

function applySprout(el: HTMLElement): void {
  if (!sprout) return;
  el.dataset.vt = 'sprout';
  el.style.setProperty('--vt-x', `${sprout.x}px`);
  el.style.setProperty('--vt-y', `${sprout.y}px`);
  el.style.setProperty('--vt-r', `${sprout.r}px`);
}

function clearSprout(): void {
  sprout = null;
  delete root.dataset.vt;
  ['--vt-x', '--vt-y', '--vt-r'].forEach((p) => root.style.removeProperty(p));
  if (!root.getAttribute('style')) root.removeAttribute('style');
}

// ——— Loading bar: only when a navigation hasn't swapped within 300 ms ———
let barTimer = 0;
let barAnims: Animation[] = [];
const bar = () => document.querySelector<HTMLElement>('[data-nav-progress]');

function showBar(): void {
  const el = bar();
  if (!el) return;
  el.classList.add('is-on');
  if (reducedMotion()) return;
  const fill = el.querySelector<HTMLElement>('.np-bar')!;
  const leaf = el.querySelector<HTMLElement>('.np-leaf')!;
  const w = el.getBoundingClientRect().width;
  barAnims = [
    fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(.85)' }], { duration: 2500, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' }),
    leaf.animate([{ transform: 'translateX(0) rotate(-20deg)' }, { transform: `translateX(${w * 0.85 - 10}px) rotate(-20deg)` }], { duration: 2500, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' }),
  ];
}

function finishBar(): void {
  window.clearTimeout(barTimer);
  const el = bar();
  if (!el || !el.classList.contains('is-on')) return;
  const done = () => {
    barAnims.forEach((a) => a.cancel());
    barAnims = [];
    el.classList.remove('is-on');
  };
  if (reducedMotion()) return done();
  const fill = el.querySelector<HTMLElement>('.np-bar')!;
  barAnims.forEach((a) => a.cancel());
  const grow = fill.animate([{ transform: 'scaleX(.85)' }, { transform: 'scaleX(1)' }], { duration: 120, fill: 'forwards' });
  barAnims = [grow];
  grow.finished.then(() => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished).then(done, done);
}

document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as Prep;
  clientNav = true;
  window.clearTimeout(barTimer);
  barTimer = window.setTimeout(showBar, 300);

  // Sprout reveal: only on arriving at Montessori at Home from elsewhere (between its own pages the
  // card illustration morphs into the scene instead), only with real view transitions, never under
  // reduced motion.
  clearSprout();
  if (supportsVT && !reducedMotion() && toAtHome(ev.to) && !toAtHome(ev.from)) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = vw / 2;
    let y = vh / 2;
    const src = ev.sourceElement;
    if (src && src.isConnected) {
      const r = src.getBoundingClientRect();
      if (r.width || r.height) {
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
    }
    const r = Math.max(Math.hypot(x, y), Math.hypot(vw - x, y), Math.hypot(x, vh - y), Math.hypot(vw - x, vh - y));
    sprout = { x: Math.round(x), y: Math.round(y), r: Math.ceil(r) };
    applySprout(root);
  }
});

// The router replaces <html> attributes on swap, so carry the sprout state onto the new document.
// Clear it when the view transition has finished (astro:page-load fires before it starts animating).
let vtRunning = false;
document.addEventListener('astro:before-swap', (e) => {
  const ev = e as Swap;
  applySprout(ev.newDocument.documentElement);
  if (sprout && ev.viewTransition) {
    vtRunning = true;
    ev.viewTransition.finished.finally(() => {
      vtRunning = false;
      clearSprout();
    });
  }
});

document.addEventListener('astro:after-swap', finishBar);

document.addEventListener('astro:page-load', () => {
  if (!vtRunning) clearSprout();
  if (!clientNav) return;
  // Move focus to the new content (or the #hash target) without a jump.
  const hash = decodeURIComponent(location.hash.slice(1));
  const target = hash ? document.getElementById(hash) : null;
  if (target) {
    if (!target.hasAttribute('tabindex') && !target.matches('a, button, input, select, textarea, summary')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  } else {
    document.getElementById('main')?.focus({ preventScroll: true });
  }
});

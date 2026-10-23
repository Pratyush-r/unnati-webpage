// Ankur keeps growing as the visitor explores: sprout → leaf → leaf → bud → flower → second flower.
// Every Ankur on the site shares one growth stage, remembered on this device only (localStorage).
// Growth plays only in answer to something the visitor did; under reduced motion parts simply appear.
import { play } from '../components/ankur';
import { animate, EASE_POP } from '../lib/motion';
import { getItem, setItem } from '../lib/storage';

const POINTS_KEY = 'unnati:ankur-growth';
const PAGES_KEY = 'unnati:pages-seen';
/** Points needed for each stage (index = stage). Change these to make him grow faster or slower. */
export const STAGES = [0, 3, 7, 12, 18, 26];
const MESSAGES = [
  '',
  'Ankur grew a new leaf.',
  'Ankur grew another leaf.',
  'Ankur has a flower bud.',
  "Ankur's first flower has opened.",
  'Ankur has a second flower.',
];

let points = Number(getItem(POINTS_KEY)) || 0;

export const stageFor = (p: number) => STAGES.reduce((s, need, i) => (p >= need ? i : s), 0);

function apply(el: Element, stage: number): void {
  for (let i = 1; i < STAGES.length; i++) el.classList.toggle(`g-on-${i}`, i <= stage);
  (el as HTMLElement).dataset.growth = String(stage);
}

const ankurs = () => Array.from(document.querySelectorAll<HTMLElement>('[data-ankur]'));
const onScreen = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return getComputedStyle(el).visibility !== 'hidden' && r.width > 0 && r.bottom > 0 && r.top < innerHeight;
};

function announce(text: string): void {
  let live = document.querySelector<HTMLElement>('[data-growth-live]');
  if (!live) {
    live = document.createElement('p');
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    live.dataset.growthLive = '';
    document.body.appendChild(live);
  }
  live.textContent = text;
}

function add(weight: number): void {
  const before = stageFor(points);
  points += weight;
  setItem(POINTS_KEY, String(points));
  const after = stageFor(points);
  if (after === before) return;
  ankurs().forEach((el) => {
    apply(el, after);
    if (!onScreen(el)) return;
    for (let i = before + 1; i <= after; i++) {
      animate(el.querySelector(`.g${i}`), [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 700, easing: EASE_POP });
    }
    void play(el, 'nod');
  });
  announce(MESSAGES[after]);
}

document.addEventListener('unnati:nurture', (e) => add(Number((e as CustomEvent<number>).detail) || 1));

// Opening an FAQ counts too (toggle doesn't bubble, so listen in the capture phase).
document.addEventListener('toggle', (e) => {
  const t = e.target as HTMLElement;
  if (t instanceof HTMLDetailsElement && t.open && t.closest('.faq, .tradeoffs')) add(1);
}, true);

document.addEventListener('astro:page-load', () => {
  const stage = stageFor(points);
  ankurs().forEach((el) => apply(el, stage));
  // Each page visited for the first time helps him grow a little.
  const path = location.pathname.replace(/\/$/, '') || '/';
  let seen: string[] = [];
  try {
    seen = JSON.parse(getItem(PAGES_KEY) || '[]');
  } catch {
    seen = [];
  }
  if (!seen.includes(path)) {
    seen.push(path);
    setItem(PAGES_KEY, JSON.stringify(seen));
    // Wait a moment so a visible Ankur has appeared before he grows.
    window.setTimeout(() => add(1), 900);
  }
});

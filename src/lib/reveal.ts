// Below-the-fold headings and cards fade up once (12 px, 300 ms, 60 ms stagger, max 6 items).
// Anything already visible on first paint is left alone.
import { reducedMotion } from './motion';

export function initReveal(): void {
  if (reducedMotion() || !('IntersectionObserver' in window)) return;
  const groups = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const vh = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const group = entry.target as HTMLElement;
        io.unobserve(group);
        items(group).forEach((el, i) => {
          el.style.setProperty('--reveal-delay', `${i * 60}ms`);
          el.classList.add('revealed');
          el.classList.remove('will-reveal');
          el.addEventListener('transitionend', () => {
            el.classList.remove('revealed');
            el.style.removeProperty('--reveal-delay');
          }, { once: true });
        });
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  groups.forEach((group) => {
    if (group.getBoundingClientRect().top < vh) return; // above the fold: visible on first paint
    items(group).forEach((el) => el.classList.add('will-reveal'));
    io.observe(group);
  });
}

function items(group: HTMLElement): HTMLElement[] {
  const kids = group.dataset.reveal === 'children' ? Array.from(group.children) : [group];
  return (kids as HTMLElement[]).slice(0, 6);
}

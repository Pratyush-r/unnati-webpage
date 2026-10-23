// Script lifecycle for Astro's client router.
// Bundled scripts run once per session, not once per page, so every component initialises on
// `astro:page-load` and tears down (listeners, observers, timers) on `astro:before-swap`.

type Cleanup = void | (() => void);

/** Run `init` on every page load (including the first). Its cleanup runs before the next swap. */
export function onPageLoad(init: () => Cleanup): void {
  let cleanup: Cleanup;
  document.addEventListener('astro:page-load', () => {
    cleanup?.();
    cleanup = init();
  });
  document.addEventListener('astro:before-swap', () => {
    cleanup?.();
    cleanup = undefined;
  });
}

/**
 * For persisted elements (header, action bar, announcement, Ankur guide): initialise each element
 * exactly once. If a page without that element is visited and a fresh copy appears later, the fresh
 * copy is initialised then.
 */
export function initOnce(selector: string, init: (el: HTMLElement) => void): void {
  document.addEventListener('astro:page-load', () => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      init(el);
    });
  });
}

/** Run after every client-side swap (persisted elements update themselves here). */
export function afterSwap(fn: () => void): void {
  document.addEventListener('astro:after-swap', fn);
}

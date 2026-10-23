// Ankur, the floating guide. Persisted across navigations: initialises once and updates on swaps.
// The complete list of what he does (add-on brief 4.2):
//   first page of a session → peek, then the greeting + tip for 4 s · tap → wave + toggle the bubble ·
//   navigation starts → travel · new page → land (tip updates) · #enquire in view → point at it ·
//   another Ankur in view → hide / peek back · every 6–9 s while visible → blink.
import { play, initBlink } from '../components/ankur';
import { tipFor, greeting, GUIDE_PAGES } from '../config/ankur-tips';
import { getItem, setItem } from '../lib/storage';
import { animate, EASE_POP } from '../lib/motion';
import { initOnce, afterSwap } from './lifecycle';
import { path } from './route';

const HIDDEN_KEY = 'unnati:ankur-hidden';
const GREETED_KEY = 'unnati:ankur-greeted';
const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches('input, select, textarea');

initOnce('[data-ankur-guide]', (guide) => {
  const dock = guide.querySelector<HTMLElement>('[data-dock]')!;
  const btn = guide.querySelector<HTMLButtonElement>('[data-ankur-btn]')!;
  const art = btn.querySelector<HTMLElement>('[data-ankur]')!;
  const bubble = guide.querySelector<HTMLElement>('[data-bubble]')!;
  const greetEl = bubble.querySelector<HTMLElement>('[data-greet]')!;
  const tipEl = bubble.querySelector<HTMLElement>('[data-tip]')!;
  const chips = bubble.querySelector<HTMLElement>('[data-chips]')!;
  const tab = guide.querySelector<HTMLButtonElement>('[data-tab]')!;

  let userHidden = getItem(HIDDEN_KEY) === '1';
  let yielding = false; // another Ankur is on screen
  let typing = false; // a form field has focus (the on-screen keyboard would push him over the form)
  let menuOpen = false;
  let shown = false;
  let autoClose = 0;
  let typingTimer = 0;
  let pageCleanup: () => void = () => {};

  const routeAllowed = () => GUIDE_PAGES.includes(path());
  const wanted = () => routeAllowed() && !userHidden && !yielding && !typing && !menuOpen;

  function fillTip(withGreeting: boolean): void {
    const tip = tipFor(path());
    greetEl.hidden = !withGreeting;
    greetEl.textContent = withGreeting ? greeting() : '';
    tipEl.textContent = tip?.text ?? '';
    chips.replaceChildren(
      ...(tip?.actions ?? []).slice(0, 2).map((a) => {
        const link = document.createElement('a');
        link.href = a.href;
        link.textContent = a.label;
        if (a.external) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        link.addEventListener('click', () => close(false));
        return link;
      }),
    );
  }

  function open(withGreeting = false): void {
    window.clearTimeout(autoClose);
    fillTip(withGreeting);
    bubble.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    animate(bubble, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 220, easing: EASE_POP });
  }

  function close(returnFocus: boolean): void {
    window.clearTimeout(autoClose);
    if (bubble.hidden) return;
    bubble.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  }

  /** Show or hide the dock to match the current state. `motion` plays peek/return or hide. */
  function render(motion: 'peek' | 'return' | 'hide' | 'none' = 'none'): void {
    guide.toggleAttribute('data-hidden', !routeAllowed());
    tab.hidden = !(routeAllowed() && userHidden);
    const want = wanted();
    if (want === shown) return;
    shown = want;
    if (want) {
      dock.classList.remove('is-away');
      const enter = motion === 'none' ? null : play(art, motion === 'hide' ? 'peek' : motion);
      if (!getItem(GREETED_KEY, 'session')) {
        // First appearance of the session: the greeting + this page's tip for 4 s. It doesn't take focus.
        setItem(GREETED_KEY, '1', 'session');
        void (enter ?? Promise.resolve()).then(() => {
          if (!shown) return;
          open(true);
          autoClose = window.setTimeout(() => close(false), 4000);
        });
      }
    } else {
      close(false);
      if (motion === 'hide') {
        void play(art, 'hide').then(() => {
          if (!shown) dock.classList.add('is-away');
        });
      } else {
        dock.classList.add('is-away');
      }
    }
  }

  // Per-page watchers: other Ankurs (one Ankur on screen at a time) and the enquiry form (point once).
  function watchPage(): void {
    pageCleanup();
    const others = Array.from(document.querySelectorAll<HTMLElement>('[data-ankur]')).filter((el) => !guide.contains(el));
    const inView = new Set<Element>();
    const recheck = () => {
      const next = [...inView].some((el) => getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0);
      if (next === yielding) return;
      yielding = next;
      render(next ? 'hide' : 'peek');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)));
      recheck();
    });
    others.forEach((el) => io.observe(el));
    // Decide the starting state synchronously, so he never flashes in over the shelf Ankur.
    const vh = window.innerHeight;
    yielding = others.some((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh && getComputedStyle(el).visibility !== 'hidden';
    });
    document.addEventListener('unnati:ankurs', recheck);

    let formIO: IntersectionObserver | null = null;
    const form = document.getElementById('enquire');
    if (form) {
      formIO = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        formIO?.disconnect();
        if (!shown) return;
        const a = btn.getBoundingClientRect();
        const card = (form.querySelector('[data-enquiry]') ?? form).getBoundingClientRect();
        const angle = (Math.atan2(card.top + card.height / 2 - (a.top + a.height / 2), card.left + card.width / 2 - (a.left + a.width / 2)) * 180) / Math.PI;
        void play(art, 'point', { angle });
      }, { threshold: 0.35 });
      formIO.observe(form);
    }
    pageCleanup = () => {
      io.disconnect();
      formIO?.disconnect();
      document.removeEventListener('unnati:ankurs', recheck);
    };
  }

  // ——— interactions ———
  btn.addEventListener('click', () => {
    void play(art, 'wave');
    if (bubble.hidden) open(false);
    else close(false);
  });
  bubble.querySelector('[data-close]')!.addEventListener('click', () => close(true));
  bubble.querySelector('[data-hide]')!.addEventListener('click', () => {
    close(false);
    userHidden = true;
    setItem(HIDDEN_KEY, '1');
    render('hide');
    window.setTimeout(() => tab.focus(), 20);
  });
  tab.addEventListener('click', () => {
    userHidden = false;
    setItem(HIDDEN_KEY, '0');
    render('return');
    btn.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bubble.hidden) close(true);
  });
  document.addEventListener('pointerdown', (e) => {
    if (!bubble.hidden && !guide.contains(e.target as Node)) close(false);
  });
  document.addEventListener('focusin', (e) => {
    if (!isField(e.target)) return;
    window.clearTimeout(typingTimer);
    typing = true;
    render('none');
  });
  document.addEventListener('focusout', (e) => {
    if (!isField(e.target)) return;
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      if (isField(document.activeElement)) return;
      typing = false;
      render('peek');
    }, 300);
  });
  document.addEventListener('unnati:menu', (e) => {
    menuOpen = (e as CustomEvent<boolean>).detail;
    render('none');
  });

  // ——— navigation ———
  document.addEventListener('astro:before-preparation', () => {
    close(false);
    if (shown) void play(art, 'travel');
  });
  afterSwap(() => {
    typing = false;
    fillTip(false);
    watchPage();
    const wasShown = shown;
    render(wasShown ? 'none' : 'peek');
    if (shown && wasShown) void play(art, 'land');
  });

  initBlink(art);
  fillTip(false);
  watchPage();
  render('peek');
});

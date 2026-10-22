// Game shell wiring shared by all five games: sound toggle, "Show me", the spoken intro on the
// first touch, Ankur's reactions and the calm completion state ([Again] [All activities]).
import { play, type AnkurState } from '../../components/ankur';
import { getItem, setItem } from '../../lib/storage';
import { chime, onSoundChange, setSound, soundOn, unlockAudio } from './audio';
import { speak, stopSpeaking } from './speech';
import { announce } from './announce';

export type ShellOptions = {
  slug: string;
  intro: string;
  done: string;
  demo: () => Promise<void> | void;
  onAgain: () => void;
};

export type Shell = {
  ankur: (state: AnkurState) => Promise<void>;
  complete: () => void;
  say: (text: string, rate?: number) => Promise<void>;
};

export function initShell(o: ShellOptions): Shell {
  const root = document.querySelector<HTMLElement>('[data-game]')!;
  const soundBtn = root.querySelector<HTMLButtonElement>('[data-sound]')!;
  const showBtn = root.querySelector<HTMLButtonElement>('[data-showme]')!;
  const overlay = root.querySelector<HTMLElement>('[data-complete]')!;
  const again = root.querySelector<HTMLButtonElement>('[data-again]')!;
  const ankurEl = root.querySelector<HTMLElement>('[data-game-ankur] [data-ankur]');

  const syncSound = (on: boolean) => {
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.querySelector('[data-label]')!.textContent = on ? 'Sound on' : 'Sound off';
    soundBtn.dataset.on = String(on);
  };
  syncSound(soundOn());
  onSoundChange(syncSound);
  soundBtn.addEventListener('click', () => {
    unlockAudio();
    const next = !soundOn();
    if (!next) stopSpeaking();
    setSound(next);
  });

  // Spoken intro on the first touch / key press (browsers only allow speech after a gesture).
  let introduced = false;
  const first = (e: Event) => {
    if (introduced) return;
    if ((e.target as Element).closest?.('[data-sound], a')) return;
    introduced = true;
    unlockAudio();
    void speak(o.intro);
  };
  root.addEventListener('pointerdown', first, true);
  root.addEventListener('keydown', first, true);

  let demoing = false;
  const runDemo = async () => {
    if (demoing) return;
    demoing = true;
    showBtn.setAttribute('aria-disabled', 'true');
    try {
      await o.demo();
    } finally {
      demoing = false;
      showBtn.removeAttribute('aria-disabled');
    }
  };
  showBtn.addEventListener('click', () => {
    if (!introduced) {
      introduced = true;
      void speak(o.intro);
    }
    void runDemo();
  });

  // Auto-play the presentation on the first visit to each game (remembered per game).
  const seenKey = `unnati:showme:${o.slug}`;
  if (!getItem(seenKey)) {
    setItem(seenKey, '1');
    window.setTimeout(() => void runDemo(), 700);
  }

  const say = (text: string, rate?: number) => speak(text, { rate });

  const complete = () => {
    overlay.hidden = false;
    root.classList.add('is-complete');
    chime();
    announce('All done');
    void play(ankurEl, 'hop').then(() => play(ankurEl, 'grow'));
    window.setTimeout(() => void say(o.done), 500);
    window.setTimeout(() => again.focus({ preventScroll: true }), 50);
  };

  again.addEventListener('click', () => {
    overlay.hidden = true;
    root.classList.remove('is-complete');
    void play(ankurEl, 'reset');
    stopSpeaking();
    o.onAgain();
  });

  return { ankur: (s) => play(ankurEl, s), complete, say };
}

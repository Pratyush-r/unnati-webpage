// Synthesised game sounds (Web Audio API, no audio files). There is no error sound.
import { getItem, setItem } from '../../lib/storage';

const KEY = 'unnati:sound';
const MASTER = 0.6;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = getItem(KEY) !== 'off';
const listeners = new Set<(on: boolean) => void>();

export const soundOn = () => enabled;

export function setSound(on: boolean): void {
  enabled = on;
  setItem(KEY, on ? 'on' : 'off');
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn: (on: boolean) => void): void {
  listeners.add(fn);
}

/** Create / resume the AudioContext. Call from a user gesture (iOS). */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = MASTER;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function ready(): AudioContext | null {
  if (!enabled) return null;
  unlockAudio();
  return ctx && master ? ctx : null;
}

/** Soft wooden "tok": 30 ms filtered noise burst + 320 Hz sine with a 120 ms decay. */
export function tok(): void {
  const c = ready();
  if (!c || !master) return;
  const t = c.currentTime;
  const len = Math.floor(c.sampleRate * 0.03);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 1.2;
  const ng = c.createGain();
  ng.gain.value = 0.35;
  noise.connect(bp).connect(ng).connect(master);
  noise.start(t);

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 320;
  const og = c.createGain();
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(og).connect(master);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** Completion chime: two soft sines a fifth apart (C5 then G5), 600 ms. */
export function chime(): void {
  const c = ready();
  if (!c || !master) return;
  const t = c.currentTime;
  [523.25, 783.99].forEach((f, i) => {
    const start = t + i * 0.18;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.42);
    osc.connect(g).connect(master!);
    osc.start(start);
    osc.stop(start + 0.45);
  });
}

/** Play a recorded file (Sandpaper Letters phonetic sounds). Resolves when it ends or fails. */
export function playFile(url: string): Promise<void> {
  if (!enabled) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      const a = new Audio(url);
      a.volume = MASTER;
      a.addEventListener('ended', () => resolve(), { once: true });
      a.addEventListener('error', () => resolve(), { once: true });
      void a.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

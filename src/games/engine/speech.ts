// Web Speech API wrapper. Prefers an en-IN voice, then en-GB, then any English voice.
// Silent no-op where unsupported. Follows the sound toggle.
import { soundOn } from './audio';

let voice: SpeechSynthesisVoice | null = null;
const synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

function pickVoice(): void {
  if (!synth) return;
  const voices = synth.getVoices();
  voice =
    voices.find((v) => v.lang.replace('_', '-').toLowerCase() === 'en-in') ||
    voices.find((v) => v.lang.replace('_', '-').toLowerCase() === 'en-gb') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export function speak(text: string, opts: { rate?: number } = {}): Promise<void> {
  if (!synth || !soundOn() || !text) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = 'en-IN';
      }
      u.rate = opts.rate ?? 0.9;
      u.pitch = 1.05;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
      // Some engines never fire onend — don't hang the caller.
      window.setTimeout(resolve, 600 + text.length * 90);
    } catch {
      resolve();
    }
  });
}

export function stopSpeaking(): void {
  try {
    synth?.cancel();
  } catch {
    /* ignore */
  }
}

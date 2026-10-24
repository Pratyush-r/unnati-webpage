// Page-transition animations for Astro's client router (transition:animate).
// Change speeds here. Keyframes live in src/styles/transitions.css. Nothing here exceeds 500 ms,
// and reduced-motion visitors see no transitions at all.
import type { TransitionDirectionalAnimations } from 'astro';

const OUT_EASE = 'cubic-bezier(.4,0,1,1)';
const IN_EASE = 'cubic-bezier(.2,.8,.2,1)';

/** Turning a page in a picture book: old content slides 24 px away and fades, new content arrives. */
export const pageSlide: TransitionDirectionalAnimations = {
  forwards: {
    old: { name: 'unnati-out-left', duration: '180ms', easing: OUT_EASE, fillMode: 'both' },
    new: { name: 'unnati-in-right', duration: '280ms', delay: '60ms', easing: IN_EASE, fillMode: 'both' },
  },
  backwards: {
    old: { name: 'unnati-out-right', duration: '180ms', easing: OUT_EASE, fillMode: 'both' },
    new: { name: 'unnati-in-left', duration: '280ms', delay: '60ms', easing: IN_EASE, fillMode: 'both' },
  },
};

/** Shared-element morphs (cards → the page they open). */
export const MORPH_MS = 320;
export const MORPH_EASE = IN_EASE;

/** Sprout reveal into Montessori at Home. */
export const SPROUT_MS = 450;

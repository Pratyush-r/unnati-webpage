// Montessori at Home activities, in display order. To add one: create a file like pouring-water.ts
// in this folder (same fields), import it here and add it to the list. Its page is built automatically.
import pouringWater from './pouring-water';
import spooningChana from './spooning-chana';
import foldingNapkins from './folding-napkins';
import slicingBanana from './slicing-banana';
import soundBoxes from './sound-boxes';
import iSpySounds from './i-spy-sounds';
import pegCounting from './peg-counting';
import sproutingMoong from './sprouting-moong';
import type { Activity } from './types';

export const activities: Activity[] = [
  pouringWater,
  spooningChana,
  foldingNapkins,
  slicingBanana,
  soundBoxes,
  iSpySounds,
  pegCounting,
  sproutingMoong,
];

export const activityBySlug = (slug: string) => activities.find((a) => a.slug === slug);

export * from './types';

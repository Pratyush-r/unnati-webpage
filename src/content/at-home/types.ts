// Montessori at Home — one file per activity in this folder; the order lives in index.ts.
export type AreaId = 'practical' | 'sensorial' | 'language' | 'maths' | 'cultural';

export type Activity = {
  slug: string;
  title: string;
  area: AreaId;
  /** Minimum age in years (2.5 = 2½). */
  minAge: number;
  time: string;
  summary: string;
  materials: string[];
  steps: string[];
  safety?: string;
  /** Three short points, each with a line icon name from src/components/icons.ts. */
  builds: { icon: string; text: string }[];
  tip: string;
  /** Short numbered captions shown with the finished scene when motion is reduced. */
  scene: string[];
};

/** Area names on cards and activity pages. */
export const AREA_NAMES: Record<AreaId, string> = {
  practical: 'Practical Life',
  sensorial: 'Sensorial',
  language: 'Language',
  maths: 'Mathematics',
  cultural: 'Cultural Studies',
};

/** Shorter names for the /at-home filter chips. */
export const FILTER_NAMES: Record<AreaId, string> = { ...AREA_NAMES, cultural: 'Cultural' };

/** Age filter chips: "Any age" plus each minimum age used by the activities. */
export const AGE_FILTERS = [2.5, 3, 4];

export const AREA_TINTS: Record<AreaId, string> = {
  practical: 'var(--sage)',
  sensorial: 'var(--blush)',
  language: 'var(--rose)',
  maths: 'var(--wheat)',
  cultural: 'var(--sky)',
};

export const ageLabel = (a: number) => (a === 2.5 ? '2½+' : `${a}+`);

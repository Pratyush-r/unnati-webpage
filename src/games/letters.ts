// Sandpaper Letters data. Hand-authored centre-line strokes in a 100 × 120 letter box
// (x-height 40, baseline 90, ascender 15, descender 115). The visible letter and the tracing
// path are the same geometry. Stroke order follows classroom print handwriting.
export type LetterDef = {
  letter: string;
  word: string;
  vowel: boolean;
  strokes: string[];
  /** Dot completed by a tap (the i). */
  dot?: { x: number; y: number };
};

export const LETTERS: LetterDef[] = [
  {
    letter: 's', word: 'sun', vowel: false,
    strokes: ['M66 47 C62 40 53 38 47 39 C37 40 32 47 34 53 C36 60 46 62 52 64 C60 66 67 70 67 78 C67 86 58 91 49 91 C40 91 34 87 32 82'],
  },
  {
    letter: 'a', word: 'ant', vowel: true,
    strokes: ['M66 50 C62 42 55 39 48 39 C37 39 31 50 31 65 C31 80 38 90 48 90 C58 90 66 82 66 66', 'M67 40 L67 90'],
  },
  {
    letter: 't', word: 'tiger', vowel: false,
    strokes: ['M48 16 L48 90', 'M32 42 L66 42'],
  },
  {
    letter: 'm', word: 'mango', vowel: false,
    strokes: ['M24 40 L24 90', 'M24 56 C26 45 32 40 39 40 C47 40 51 46 51 54 L51 90', 'M51 54 C53 45 59 40 66 40 C74 40 78 46 78 54 L78 90'],
  },
  {
    letter: 'p', word: 'peacock', vowel: false,
    strokes: ['M32 40 L32 115', 'M32 54 C35 44 43 39 51 39 C62 39 69 49 69 64 C69 80 61 90 50 90 C42 90 35 85 32 77'],
  },
  {
    letter: 'i', word: 'insect', vowel: true,
    strokes: ['M50 42 L50 90'],
    dot: { x: 50, y: 24 },
  },
  {
    letter: 'n', word: 'nest', vowel: false,
    strokes: ['M34 40 L34 90', 'M34 56 C36 46 43 40 51 40 C61 40 66 47 66 56 L66 90'],
  },
  {
    letter: 'c', word: 'coconut', vowel: false,
    strokes: ['M67 49 C63 42 56 39 49 39 C38 39 31 50 31 65 C31 80 38 90 49 90 C57 90 63 86 67 80'],
  },
];

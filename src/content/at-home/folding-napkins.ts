import type { Activity } from './types';

export default {
  slug: 'folding-napkins',
  title: 'Folding Napkins',
  area: 'practical',
  minAge: 3,
  time: '10 min',
  summary: 'Folding cloth napkins neatly and stacking them in a basket.',
  materials: ['Three or four square cloth napkins or handkerchiefs', 'A small basket'],
  steps: [
    'Lay one napkin flat on a table and smooth it with both hands.',
    'Pick up the two bottom corners and bring them to meet the two top corners.',
    'Run your hand slowly along the fold to press it.',
    'Fold it once more into a square and press again.',
    'Place it in the basket, and invite your child to fold the next one.',
  ],
  builds: [
    { icon: 'star', text: 'Precision and order' },
    { icon: 'clipboard', text: 'Following a sequence' },
    { icon: 'home', text: 'Care for the home' },
  ],
  tip: 'For younger children, start with a single fold in half.',
  scene: ['Smooth the napkin flat.', 'Fold the bottom up to meet the top.', 'Fold once more into a square.'],
} satisfies Activity;

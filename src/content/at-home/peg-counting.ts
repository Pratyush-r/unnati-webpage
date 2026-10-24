import type { Activity } from './types';

export default {
  slug: 'peg-counting',
  title: 'Peg Counting',
  area: 'maths',
  minAge: 4,
  time: '10 min',
  summary: 'Matching numerals to quantities by clipping clothes pegs onto number cards.',
  materials: [
    'Five cards cut from a cereal box, numbered 1 to 5, with that many dots under each numeral',
    'Fifteen clothes pegs',
    'A basket',
  ],
  steps: [
    'Lay the cards in a row from 1 to 5.',
    'Point to the numeral and say its name together, then touch each dot.',
    'Clip the same number of pegs onto the card\'s edge, counting aloud.',
    'Move to the next card.',
    'Check by matching each peg to a dot.',
  ],
  builds: [
    { icon: 'calculator', text: 'Linking numerals to quantities' },
    { icon: 'check', text: 'One-to-one counting' },
    { icon: 'hand', text: 'Finger strength for writing' },
  ],
  tip: 'The dots are the control of error. Let your child find and fix a mistake on their own.',
  scene: ['Touch each dot on the "3" card.', 'Clip one peg for each dot.', 'Three pegs, three dots.'],
} satisfies Activity;

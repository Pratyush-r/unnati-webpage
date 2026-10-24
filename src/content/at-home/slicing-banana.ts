import type { Activity } from './types';

export default {
  slug: 'slicing-banana',
  title: 'Slicing a Banana',
  area: 'practical',
  minAge: 3,
  time: '15 min',
  summary: 'Your child peels and slices a banana to share with the family.',
  materials: ['A ripe banana', 'A blunt butter knife', 'A small chopping board', 'A plate'],
  safety: 'Use a blunt butter knife only and stay beside your child throughout.',
  steps: [
    'Wash hands together.',
    'Peel the banana. Start the peel for younger children and let them finish.',
    'Place the banana on the board and hold one end with your fingertips.',
    'Slice slowly with a gentle back-and-forth movement.',
    'Place the slices on the plate.',
    'Invite your child to offer the slices to someone in the family.',
  ],
  builds: [
    { icon: 'hand', text: 'Hand strength and control' },
    { icon: 'jug', text: 'Food preparation' },
    { icon: 'heart', text: 'The joy of contributing' },
  ],
  tip: 'Serving others is the reward. No praise needed, just a sincere "thank you".',
  scene: ['Hold one end of the banana.', 'Slice slowly, back and forth.', 'Three slices, ready to share.'],
} satisfies Activity;

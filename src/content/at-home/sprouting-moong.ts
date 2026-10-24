import type { Activity } from './types';

export default {
  slug: 'sprouting-moong',
  title: 'Sprouting Moong',
  area: 'cultural',
  minAge: 3,
  time: '5 min a day for 4–5 days',
  summary: 'Growing moong sprouts and watching roots and shoots appear day by day.',
  materials: [
    'A handful of whole green moong',
    'A bowl of water',
    'A plate',
    'A clean cotton cloth',
    'Paper and crayons',
  ],
  steps: [
    'Soak the moong in water overnight.',
    'Next morning, drain it and spread the seeds on a damp cloth on the plate.',
    'Each day, look closely together and sprinkle a little water to keep the cloth damp.',
    'Notice the tiny root first, then the shoot.',
    'Draw what you see each day.',
    'When they have grown, cook them together into a meal.',
  ],
  builds: [
    { icon: 'eye', text: 'Careful observation' },
    { icon: 'clock', text: 'Patience' },
    { icon: 'sprout', text: 'Care for living things' },
  ],
  tip: 'Unnati means growth, so this one is close to our hearts.',
  scene: ['A soaked moong seed on the damp cloth.', 'The seed splits and a tiny root appears.', 'A shoot rises with two small leaves.'],
} satisfies Activity;

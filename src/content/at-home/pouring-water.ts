import type { Activity } from './types';

export default {
  slug: 'pouring-water',
  title: 'Pouring Water',
  area: 'practical',
  minAge: 2.5,
  time: '10 min',
  summary: 'Your child pours water from a small jug into a tumbler, all by themselves.',
  materials: ['A small steel jug', 'A steel tumbler', 'A tray', 'A small sponge or cloth'],
  steps: [
    'Fill the jug about a quarter full and place it on the tray, with the tumbler beside it.',
    'Sit beside your child. Hold the handle with one hand and rest two fingers of the other hand under the spout.',
    'Pour very slowly until the jug is empty. Pause so the last drop falls.',
    'Pour the water back into the jug the same slow way.',
    'If any water spills, wipe it with the sponge. Wiping is part of the work.',
    'Ask, "Would you like to try?" and hand over the tray.',
  ],
  builds: [
    { icon: 'hand', text: 'Hand control and coordination' },
    { icon: 'eye', text: 'Concentration' },
    { icon: 'jug', text: 'Independence at meal times' },
  ],
  tip: 'Use only a little water at first. Add more once your child pours steadily.',
  scene: ['Lift the jug by its handle.', 'Tilt it slowly over the tumbler.', 'Pour until the last drop falls, then set it down.'],
} satisfies Activity;

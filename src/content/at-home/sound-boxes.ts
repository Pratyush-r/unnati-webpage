import type { Activity } from './types';

export default {
  slug: 'sound-boxes',
  title: 'Sound Boxes',
  area: 'sensorial',
  minAge: 2.5,
  time: '10 min',
  summary: 'Shaking little boxes and finding the two that sound the same.',
  materials: [
    'Six identical small steel containers with lids',
    'A little rice',
    'A little toor dal',
    'A little salt',
    'Tape',
    'A small sticker or dot for each pair',
  ],
  safety: 'Tape the lids shut firmly before your child uses them.',
  steps: [
    'Fill two containers with rice, two with dal and two with salt, about a third full. Tape the lids.',
    'Put matching dots under each pair, out of sight.',
    'Shake one container gently, close to your ear, and listen.',
    'Shake the others one by one to find the box that sounds the same.',
    'Place the matching pair side by side, and continue with the rest.',
    'Turn the pairs over to check the dots together.',
  ],
  builds: [
    { icon: 'sound-on', text: 'Careful listening' },
    { icon: 'choose', text: 'Comparing and matching' },
    { icon: 'check', text: 'Self-checking with the dots' },
  ],
  tip: 'Do this somewhere quiet. Shake gently and listen together.',
  scene: ['Shake one box gently and listen.', 'Shake another to find the same sound.', 'Set the matching pair side by side.'],
} satisfies Activity;

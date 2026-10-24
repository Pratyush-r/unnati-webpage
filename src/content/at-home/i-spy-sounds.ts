import type { Activity } from './types';

export default {
  slug: 'i-spy-sounds',
  title: 'I Spy Sounds',
  area: 'language',
  minAge: 3,
  time: '5–10 min',
  summary: 'A listening game that helps your child hear the first sound in a word: the first step to reading.',
  materials: [
    'A basket',
    'Four or five familiar objects (for example a cup, a spoon, a sock, a toy car, a mango)',
    'A mat or cloth',
  ],
  steps: [
    'Lay the objects on the mat and name each one together.',
    'Say, "I spy with my little eye something that begins with /k/." Say the sound, not the letter name.',
    'Let your child find the cup.',
    'Continue with the other objects.',
    'When it\'s easy, try two objects with the same first sound, and later the last sound.',
  ],
  builds: [
    { icon: 'sound-on', text: 'Hearing sounds in words' },
    { icon: 'chat', text: 'Vocabulary' },
    { icon: 'book', text: 'Readiness for reading and writing' },
  ],
  tip: 'Always use the letter\'s sound ("mmm"), never its name ("em").',
  scene: ['Lay the objects on the mat.', 'Say the sound: /k/.', 'Your child lifts the cup.'],
} satisfies Activity;

import type { Activity } from './types';

export default {
  slug: 'spooning-chana',
  title: 'Spooning Chana',
  area: 'practical',
  minAge: 2.5,
  time: '10 min',
  summary: 'Moving dry chana from one katori to another, one careful spoonful at a time.',
  materials: ['Two small katoris', 'A teaspoon', 'A handful of dry kabuli chana', 'A tray'],
  safety: 'Chana are small. Stay with your child, and choose this activity only once your child no longer puts objects in their mouth.',
  steps: [
    'Place the katori with chana on the left and the empty katori on the right.',
    'Hold the spoon like a pencil and show your child your grip.',
    'Scoop slowly, carry the spoon across and tip the chana in.',
    'Repeat, left to right, until the left katori is empty.',
    'Pick up any fallen chana with your fingers and drop them in.',
    'Move the full katori back to the left for your child\'s turn.',
  ],
  builds: [
    { icon: 'hand', text: 'Wrist and finger control' },
    { icon: 'arrow-right', text: 'Left-to-right movement that prepares for writing' },
    { icon: 'eye', text: 'Concentration' },
  ],
  tip: 'When it becomes easy, change to a smaller spoon.',
  scene: ['Scoop chana from the left katori.', 'Carry the spoon slowly across.', 'Tip the chana into the right katori.'],
} satisfies Activity;

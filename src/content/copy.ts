// Approved copy (brief Section 6). Use as written — don't paraphrase mission, vision or founder note.
// Phone numbers, address and status labels are rendered from src/config/site.ts, never typed here.
import { site } from '../config/site';

export const mission =
  'At Unnati Montessori, we nurture independent, confident, and compassionate learners through an authentic Montessori approach, fostering a lifelong love of learning.';

export const vision =
  'Our vision is to be a centre of excellence in Montessori education, where every child is empowered to reach their fullest potential. We aspire to cultivate a community of joyful learners who embody creativity, resilience, empathy, and a deep respect for themselves, others, and the world around them. At Unnati, we believe that by nurturing the whole child, we lay the foundation for a brighter and more harmonious future.';

export const ourName = {
  word: 'Unnati',
  devanagari: 'उन्नति',
  meaning: 'means growth and progress — the steady kind that begins from within each child.',
};

export const founderNote = [
  "I'm Manisha Aashish, an AMI Montessori educator with over 10 years of experience. I completed my AMI Primary training (2.5–6 years) at Navadisha Montessori and my Elementary Montessori training (6–12 years) through NCVRT.",
  'Our journey began with Unnati – After School for Children and Unnati – Homeschooling, reaching many children along the way. Yet, the dream of opening our own school never faded, and today, that dream is taking shape with Unnati Montessori.',
  'I believe every child deserves the freedom, respect, and environment to grow into a confident, independent, and joyful learner. For me, Montessori is more than an educational approach — it is about understanding and respecting each child as an individual and nurturing a lifelong love for learning.',
];

export const founderExcerpt =
  'I believe every child deserves the freedom, respect, and environment to grow into a confident, independent, and joyful learner.';

export const journey = [
  { title: 'Unnati – After School for Children', text: 'Where it began: after-school time with children, guided by Montessori values.' },
  { title: 'Unnati – Homeschooling', text: 'Supporting families who chose to learn at home, reaching many more children.' },
  { title: 'Unnati Montessori', text: 'The dream of our own school, taking shape in Mogappair West.' },
];

export type Programme = {
  id: 'primary' | 'daycare' | 'afterschool';
  name: string;
  ages?: string;
  text: string;
  more?: string;
  href?: string;
};

export const programmes: Programme[] = [
  {
    id: 'primary',
    name: 'Primary Environment',
    ages: `Ages ${site.primary.ages}`,
    text: 'A mixed-age Montessori classroom where younger children learn by watching and older children grow by leading. Children work across the five areas of the Montessori curriculum in an environment prepared to their size.',
    href: '/approach',
  },
  {
    id: 'daycare',
    name: site.dayCare.name,
    ages: `Ages ${site.dayCare.ages}`,
    text: "A warm, calm day care in the same prepared environment, with the same respect for each child's rhythm.",
    more: site.dayCare.hours ? `Timings: ${site.dayCare.hours}.` : 'Call or WhatsApp us for timings.',
    href: '/day-care',
  },
  {
    id: 'afterschool',
    name: 'After-school Activities',
    text: 'Where Unnati began: after-school activities for children, guided by the same Montessori values.',
    more: 'Call or WhatsApp us for details.',
  },
];

export const yearRound =
  'Montessori is a year-round admission programme. Children can join throughout the year, entering the prepared environment when they are developmentally ready — without waiting for a new academic year.';

export const freedomQuote = {
  lead: 'Freedom in Montessori is the freedom to choose, act and learn independently — within clear limits that ensure respect, responsibility and order.',
  close: 'The goal is not freedom from boundaries, but freedom through discipline and responsibility.',
};

export const principles = [
  { label: 'Child-centred learning', text: "Every decision starts from the child's natural development." },
  { label: 'Prepared environment', text: "A calm, ordered room built to the child's size, inviting independent work." },
  { label: 'Hands-on learning', text: 'Children learn with real, concrete materials before abstract ideas.' },
  { label: 'Self-directed activity', text: 'Children choose their work and repeat it until they master it.' },
  { label: 'Respect for the child', text: 'Each child is seen as a capable individual with their own pace.' },
  { label: 'Mixed-age classrooms', text: 'Younger children learn by watching; older children grow by helping.' },
  { label: 'Freedom within limits', text: 'Freedom to choose and act, within clear limits of respect, responsibility and order.' },
  { label: 'Intrinsic motivation', text: 'The joy of learning comes from within, not from stars, marks or rewards.' },
];

export type Area = {
  id: string;
  name: string;
  text: string;
  /** The Montessori at Home activity for this area. */
  activity: string;
  href: string;
  material: string;
  tint: string;
};

export const areas: Area[] = [
  { id: 'practical', name: 'Practical Life', text: 'Develops independence, coordination and care for self and the environment.', activity: 'Pouring Water', href: '/at-home/pouring-water', material: 'Jug and glass on a tray', tint: 'var(--sage)' },
  { id: 'sensorial', name: 'Sensorial', text: 'Refines the senses and helps children explore, compare and classify the world around them.', activity: 'Sound Boxes', href: '/at-home/sound-boxes', material: 'Knobbed cylinder block', tint: 'var(--blush)' },
  { id: 'language', name: 'Language', text: 'Builds strong communication skills through listening, speaking, reading and writing experiences.', activity: 'I Spy Sounds', href: '/at-home/i-spy-sounds', material: 'Pink sandpaper letter "s"', tint: 'var(--rose)' },
  { id: 'maths', name: 'Mathematics', text: 'Introduces number concepts, operations and problem-solving through concrete experiences.', activity: 'Peg Counting', href: '/at-home/peg-counting', material: 'Spindle box', tint: 'var(--wheat)' },
  { id: 'cultural', name: 'Cultural Studies', text: 'Explores geography, science, history, art and music to understand the world and our place in it.', activity: 'Sprouting Moong', href: '/at-home/sprouting-moong', material: 'Land-and-water globe', tint: 'var(--sky)' },
];


export const compare = [
  { icon: 'choose', m: 'The child chooses their activities.', t: 'The teacher decides what and when to learn.' },
  { icon: 'hand', m: 'Hands-on, practical learning with concrete materials.', t: 'Theoretical learning based on books and memorisation.' },
  { icon: 'clock', m: "Respects each child's individual pace.", t: 'The same pace for all children.' },
  { icon: 'star', m: 'Fosters independence, self-confidence and autonomy.', t: 'Fosters dependence on the adult and the need for approval.' },
  { icon: 'home', m: 'A prepared environment to explore, discover and grow.', t: 'Structured classrooms in rows, focused on control.' },
];
export const compareClose = 'Different paths, same goal: happy, confident children who love to learn.';


export const registerSteps = [
  { title: 'Reach out', text: (phone: string) => `Call or WhatsApp ${site.contactPerson.split(' ')[0]} on ${phone}, or send the form.` },
  { title: 'Meet us', text: () => "We'll share the details and answer every question." },
  { title: 'Join when ready', text: () => 'Admissions are open all year.' },
];

// Day Care facts confirmed by the owner: ages 1–6, rest / nap time, daily updates to parents.
// Hours come from site.dayCare.hours. Do not add other facility claims without confirmation.
export const dayCare = {
  subhead: 'A calm, unhurried day in Mogappair West, in the same prepared environment.',
  lead: `A warm, calm day care in the same prepared environment, with the same respect for each child's rhythm. Children aged ${site.dayCare.ages} spend their extended day the Montessori way: real work, rest when they need it, and adults who follow the child.`,
  ideas: [
    { icon: 'shelf', title: 'The same prepared environment', text: 'Low shelves, child-sized furniture and real materials. The extended day happens in a space built for children, not just for minding them.' },
    { icon: 'hand', title: 'Care that builds independence', text: 'Washing hands, putting on shoes, tidying up. Everyday care is practical life, and children are helped to do it themselves.' },
    { icon: 'clock', title: "Each child's own rhythm", text: 'Children are not hurried from one thing to the next. The youngest are given all the time they need.' },
    { icon: 'heart', title: 'Grace & courtesy', text: 'Greeting a friend, waiting a turn, offering help. Kindness is practised all through the day.' },
  ],
  rhythm: [
    { title: 'A warm welcome', text: 'Each child is greeted by name and settles in at their own pace.' },
    { title: 'Purposeful work', text: 'Children choose real work from the shelves — pouring, sorting, matching, building — and repeat it as often as they like.' },
    { title: 'Rest', text: 'A quiet rest and nap time every day, in a calm space set aside for it.' },
    { title: 'A gentle afternoon', text: 'Quiet, unhurried activities and time with friends.' },
    { title: 'Going home', text: "You hear how your child's day went — every day." },
  ],
  forParents: [
    { icon: 'moon', title: 'Rest and nap time', text: 'Young children need real rest. There is a quiet rest and nap time every day, in a calm space set aside for it.' },
    { icon: 'chat', title: 'Daily updates', text: "You'll get an update on your child's day, every day, so you always know how they are doing." },
  ],
  ages: {
    title: 'From first steps to school readiness',
    text: `Extended Day Care welcomes children aged ${site.dayCare.ages}. From 2½, children can also join our Primary Environment.`,
  },
};

// Montessori at Home (round 2 brief, 6.1, 6.3, 6.5 and 6.6).
export const atHome = {
  title: 'Montessori at Home',
  lead: "Montessori doesn't stop at the classroom door. These are simple activities you can set up with things already in your kitchen: slow, purposeful work that builds independence and concentration.",
  small: 'Try one activity a week. Show it slowly, say very little, and then let your child have a go.',
  teaserLine: 'Simple activities to try at home this week, using things from your kitchen.',
  teaser: ['pouring-water', 'sound-boxes', 'sprouting-moong'],
  ctaTitle: 'Want this every day?',
  ctaLine: 'Our Primary Environment is prepared for exactly this kind of work, every morning.',
};

// Prepared Home explorer hotspots, in reading order across the room (left to right).
// x/y place each leaf marker as a percentage of the room illustration.
export const preparedHome = {
  title: 'A prepared home',
  line: 'Small changes help your child do more by themselves. Tap a leaf in the room to explore.',
  spots: [
    { id: 'hooks', title: 'Low hooks by the door', x: 18.3, y: 42, text: 'A hook for their bag and a basket for footwear, so coming home and going out become "I can do it myself."' },
    { id: 'shelf', title: 'A low open shelf', x: 33.3, y: 59.5, text: "A few activities, each in its own basket or tray, at your child's eye level. Change them every week or two. Fewer choices mean deeper concentration." },
    { id: 'books', title: 'A cosy book corner', x: 49.7, y: 44.5, text: 'A few books facing forward in a low rack, with a cushion. Change them often; children choose by the covers.' },
    { id: 'table', title: 'A child-sized table and chair', x: 63.9, y: 66, text: 'Feet flat on the floor and elbows at table height. A place to work, eat and draw without help.' },
    { id: 'water', title: 'A self-serve water corner', x: 79.9, y: 47.5, text: 'A small jug, a tumbler and a cloth on a low tray. Your child pours a drink when thirsty, and wipes up any spills.' },
    { id: 'stool', title: 'A step stool at the basin', x: 91.5, y: 76, text: 'So your child can wash their hands, rinse vegetables and be part of the kitchen.' },
  ],
  zero: 'Tap a leaf in the room to explore.',
  all: 'Your home is ready for independent work.',
};

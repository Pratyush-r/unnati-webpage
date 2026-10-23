// Ankur's tips — one per page (approved copy, add-on brief Section 6).
// Edit the text here. Phone and WhatsApp links are always built from src/config/site.ts.
import { site, telHref, wa, waText } from './site';

export type TipAction = { label: string; href: string; external?: boolean };
export type Tip = { text: string; actions: TipAction[] };

const call = (number: typeof site.school): TipAction => ({ label: 'Call', href: telHref(number) });
const whatsapp = (label: string, number: typeof site.school, text: string): TipAction => ({ label, href: wa(number, text), external: true });

export const tips: Record<string, Tip> = {
  '/': {
    text: "Hello, I'm Ankur! Tap anything on the shelf to see it move.",
    actions: [{ label: 'Play a game', href: '/play' }, { label: 'Enquire', href: '#enquire' }],
  },
  '/about': {
    text: "Unnati means growth. That's why I'm a little sprout!",
    actions: [{ label: 'Our approach', href: '/approach' }, { label: 'Enquire', href: '/admissions#enquire' }],
  },
  '/approach': {
    text: 'Tap a principle on the wheel to read about it.',
    actions: [{ label: 'Montessori vs traditional', href: '#compare' }, { label: 'Play a game', href: '/play' }],
  },
  '/admissions': {
    text: 'Good news: children can join any time of the year.',
    actions: [whatsapp('WhatsApp us', site.school, waText.general), call(site.school)],
  },
  // Not in the approved list: Extended Day Care was added later at the owner's request.
  // Uses only confirmed facts (ages 1–6, timings on request). Review before launch.
  '/day-care': {
    text: `${site.dayCare.name} welcomes children aged ${site.dayCare.ages}. Ask us about timings.`,
    actions: [whatsapp('WhatsApp us', site.school, waText.programme(site.dayCare.name)), call(site.school)],
  },
  '/play': {
    text: "Pick an activity. They're best enjoyed together with a grown-up.",
    actions: [],
  },
  '/teach': {
    text: `Our Primary Montessori Teacher Training starts in ${site.teacherTraining.startLabel}.`,
    actions: [whatsapp('Apply on WhatsApp', site.school, waText.training), call(site.school)],
  },
  '/consultancy': {
    text: "Building your own Montessori school? Let's talk.",
    actions: [whatsapp('WhatsApp us', site.consultancy, waText.consultancy), call(site.consultancy)],
  },
  '/contact': {
    text: 'We\'re near Casagrand Millenia. Tap Get directions for the way.',
    actions: [{ label: 'Get directions', href: site.mapsUrl, external: true }, call(site.school)],
  },
};

/** Pages where the floating guide appears. Games, /404 and /privacy have none. */
export const GUIDE_PAGES = Object.keys(tips);

export const tipFor = (path: string): Tip | undefined => tips[path];

/** Time greeting for the first bubble of a session, from the visitor's clock. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning!';
  if (h >= 12 && h < 17) return 'Good afternoon!';
  return 'Good evening!';
}


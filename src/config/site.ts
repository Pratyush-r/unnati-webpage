// Single source of truth for every fact on the site.
// Phone numbers, address, status and timings are typed here and nowhere else.

export const site = {
  name: 'Unnati Montessori',
  tagline: 'A House for Children',
  status: 'opening-shortly' as 'opening-shortly' | 'open',
  contactPerson: 'Manisha Aashish',
  school: { display: '+91 75500 22403', tel: '+917550022403', wa: '917550022403' }, // admissions, day care, teacher training, hiring
  consultancy: { display: '+91 90035 84303', tel: '+919003584303', wa: '919003584303' },
  address: {
    street: 'Chanakyan Cross Road, Annamalai Avenue',
    area: 'Mogappair West',
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'IN',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Chanakyan+Cross+Road%2C+Annamalai+Avenue%2C+Mogappair+West%2C+Chennai',
  primary: { ages: '2½–6' },
  dayCare: {
    name: 'Extended Day Care',
    ages: '1–6',
    // Leave empty until timings are confirmed; the site then says "Call or WhatsApp us for timings."
    // Example: 'Monday to Saturday, 8:30 am – 6:30 pm'
    hours: '',
  },
  teacherTraining: { startLabel: 'November 2026', applyOpen: true },
  hiring: { open: true, role: 'AMI / IMTC Primary Montessori trained educators' },
  announcement: 'Admissions open for ages 2½–6 · Extended Day Care from age 1 · Join any time of the year',
  social: { instagram: '', facebook: '', youtube: '' }, // an icon renders only when filled
};

export type Phone = typeof site.school;

export const statusLabel = site.status === 'open' ? 'Now open' : 'Opening shortly';

export const fullAddress = `${site.address.street}, ${site.address.area}, ${site.address.city}`;

export const siteUrl = (import.meta.env.SITE_URL || 'https://unnati-montessori.netlify.app').replace(/\/$/, '');

export const webhookUrl: string = import.meta.env.PUBLIC_ENQUIRY_WEBHOOK_URL || '';

/** WhatsApp deep link. Every WhatsApp button on the site is built with this. */
export function wa(number: Phone, text: string): string {
  return `https://wa.me/${number.wa}?text=${encodeURIComponent(text)}`;
}

export const telHref = (number: Phone) => `tel:${number.tel}`;

export const waText = {
  general: 'Hello Unnati Montessori! I\'d like to know more.',
  programme: (p: string) => `Hello Unnati Montessori! I'd like to know more about ${p}.`,
  training: `Hello! I'd like to apply for the Primary Montessori Teacher Training starting ${site.teacherTraining.startLabel}.`,
  hiring: "Hello! I'm a Montessori-trained educator and I'd like to apply to Unnati Montessori.",
  consultancy: "Hello! I'd like to talk about Montessori consultancy for my school.",
};

// Single source of truth for every fact on the site.
// Phone numbers, address, status and timings are typed here and nowhere else.

export const site = {
  name: 'Unnati Montessori',
  status: 'opening-shortly' as 'opening-shortly' | 'open',
  contactPerson: 'Manisha Aashish',
  // The one number for everything: admissions, day care, teacher training, hiring and consultancy.
  school: { display: '+91 75500 22403', tel: '+917550022403', wa: '917550022403' },
  address: {
    plot: 'Plot No. 5',
    street: 'Chanakyan Cross Road, Annamalai Avenue',
    area: 'Mogappair West',
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'IN',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Plot+No.+5%2C+Chanakyan+Cross+Road%2C+Annamalai+Avenue%2C+Mogappair+West%2C+Chennai',
  // Rename the first-plane section here; this is the only place the title is typed.
  firstPlaneTitle: 'The First Plane of Development · Birth to 6',
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
  announcement: 'Admissions open for ages 2½–6 · Join any time of the year',
  // Ankur, the floating guide. Set to false and the guide doesn't render anywhere.
  ankurGuide: true,
  social: { instagram: '', facebook: '', youtube: '' }, // an icon renders only when filled
};

export type Phone = typeof site.school;

export const statusLabel = site.status === 'open' ? 'Now open' : 'Opening shortly';

/** "Plot No. 5, Chanakyan Cross Road, Annamalai Avenue, Mogappair West, Chennai" */
export function formatAddress(): string {
  const a = site.address;
  return `${a.plot}, ${a.street}, ${a.area}, ${a.city}`;
}

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

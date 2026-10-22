// FAQ and consultancy copy (brief 6.9, 6.13, 6.14) plus the Day Care FAQ.
// Answers are HTML strings so they can carry links; facts are interpolated from site.ts.
import { site, fullAddress, telHref, wa, waText } from '../config/site';

export type QA = { q: string; a: string };

const schoolPhone = `<a href="${telHref(site.school)}">${site.school.display}</a>`;

export const parentFaq: QA[] = [
  { q: 'What age group do you take?', a: `Our Primary Environment is for children aged 2½ to 6 years. ${site.dayCare.name} welcomes children aged ${site.dayCare.ages}.` },
  { q: 'Can my child join in the middle of the year?', a: 'Yes. Montessori is a year-round admission programme, so your child can join whenever they are developmentally ready.' },
  { q: 'Do you offer day care and after-school activities?', a: `Yes, alongside our Primary Environment. <a href="/day-care">More about ${site.dayCare.name} →</a>` },
  { q: 'Who will guide my child?', a: 'Our founder, Manisha Aashish, is an AMI-trained Montessori educator with over 10 years of experience, and we are building our team with AMI/IMTC Primary-trained educators.' },
  { q: 'How is Montessori different from a regular preschool?', a: 'Children choose purposeful work with hands-on materials, learn at their own pace and grow independent. <a href="/approach#compare">See the differences →</a>' },
  { q: 'What are the fees and timings?', a: `Call or WhatsApp us on ${schoolPhone} and we'll share the details for your child's programme.` },
  { q: 'Where are you?', a: `${fullAddress} — near Casagrand Millenia. <a href="${site.mapsUrl}" target="_blank" rel="noopener">Get directions →</a>` },
];

export const dayCareFaq: QA[] = [
  { q: 'What ages do you take?', a: `Children aged ${site.dayCare.ages} years.` },
  {
    q: 'What are the timings?',
    a: site.dayCare.hours
      ? `${site.dayCare.hours}. Call or WhatsApp us on ${schoolPhone} for anything else.`
      : `Call or WhatsApp us on ${schoolPhone} for timings.`,
  },
  { q: 'Is there a rest time?', a: 'Yes. Children have a quiet rest and nap time every day, in a calm space set aside for it.' },
  { q: "Will I know how my child's day went?", a: "Yes. You'll get an update on your child's day, every day." },
  { q: 'Can my child join in the middle of the year?', a: 'Yes. Admissions are open all year.' },
  { q: 'What about fees and other details?', a: `Call or WhatsApp us on ${schoolPhone} and we'll share the details.` },
];

export const consultancy = {
  services: [
    { icon: 'school', title: 'School Setup Support', text: 'End-to-end guidance to plan, design and set up your Montessori school.' },
    { icon: 'layout', title: 'Environment & Material Planning', text: 'Classroom layouts and child-centred spaces, with guidance on selecting, sourcing and making authentic, age-appropriate materials.' },
    { icon: 'teacher', title: 'Teacher Training Support', text: 'Identifying training programmes and mentors, and developing confident, capable Montessori guides.' },
    { icon: 'doc', title: 'Policy Development', text: 'School policies, procedures and handbooks.' },
    { icon: 'book', title: 'Curriculum Development', text: 'An age-appropriate, authentic Montessori curriculum.' },
    { icon: 'badge', title: 'Licensing & Compliance', text: 'Support with NOC, recognition, affiliation and other statutory requirements.' },
    { icon: 'clipboard', title: 'Operational Planning', text: 'Schedules, admissions, staffing, parent communication and daily operations.' },
    { icon: 'megaphone', title: 'Marketing & Branding Guidance', text: "Creating your school's identity and reaching the right community." },
    { icon: 'handshake', title: 'Ongoing Mentorship & Handholding', text: 'Continuous support, classroom observations and a problem-solving partnership.' },
    { icon: 'sprout', title: 'Work with Existing Schools', text: 'Integrating or strengthening Montessori practices in your school.' },
  ],
  servicesLine: 'Our goal is to empower you to build a high-quality, authentic Montessori school that nurtures children and grows sustainably.',
  approach: [
    { icon: 'heart', title: 'Child-centric', text: "Every decision supports the child's natural development." },
    { icon: 'sprout', title: 'Authentic & practical', text: 'Rooted in Montessori philosophy, designed for real-world implementation.' },
    { icon: 'people', title: 'Collaborative', text: 'We work with you, not just for you.' },
    { icon: 'globe', title: 'Sustainable', text: 'Building environments and systems that last and grow.' },
  ],
  whoWeWorkWith: [
    'Aspiring Montessori school owners',
    'Existing schools transitioning to Montessori',
    'Educators and training institutes',
    'Organisations and NGOs in education',
  ],
  franchiseQuote: 'Follow our model.',
  consultancyQuote: 'Build your own school with expert Montessori guidance.',
  different: [
    { icon: 'school', title: 'Your name, your school', text: 'Name and brand your school in your own name.' },
    { icon: 'rupee', title: 'No revenue sharing', text: 'No percentage of your income is taken.' },
    { icon: 'doc', title: 'No fixed curriculum', text: 'Shape the curriculum around the needs of your children.' },
    { icon: 'people', title: 'Parent orientation', text: 'We conduct parent orientation and explain Montessori materials and philosophy.' },
    { icon: 'teacher', title: 'Teacher training', text: 'Support and guidance for your teaching team.' },
    { icon: 'star', title: 'Freedom to lead', text: 'Run and develop your school your way.' },
    { icon: 'sprout', title: 'Freedom to grow', text: 'Grow your school independently.' },
    { icon: 'heart', title: 'Flexibility', text: 'We adapt to your needs and support you accordingly.' },
  ],
  tradeOffs: [
    'High initial investment',
    'Limited decision-making freedom',
    'Ongoing royalty and renewal fees',
    'Less flexibility',
    'Dependence on the brand',
    'A standardised approach',
    'Vendor and material restrictions',
    'Contractual restrictions',
    'Limited brand ownership',
    'Changes controlled by the franchisor',
  ],
  whyFail: [
    { icon: 'people', text: 'Low student enrolment' },
    { icon: 'pin', text: 'Wrong location' },
    { icon: 'growth', text: 'High operating costs' },
    { icon: 'calculator', text: 'Poor financial planning' },
    { icon: 'teacher', text: 'Lack of trained teachers' },
    { icon: 'megaphone', text: 'Weak marketing and branding' },
    { icon: 'chat', text: 'Poor parent communication' },
    { icon: 'badge', text: 'Inconsistent educational quality' },
    { icon: 'gear', text: 'Poor management and systems' },
    { icon: 'target', text: 'Lack of long-term planning' },
  ],
  whyFailClose: 'build a strong foundation, avoid common pitfalls and create a thriving Montessori school that makes a real difference.',
};

export const consultancyFaq: QA[] = [
  { q: 'Do you help with setting up a Montessori school from scratch?', a: 'Yes. End to end — from planning and environment design to materials, policies and teacher support.' },
  { q: 'Can you help an existing school transition to Montessori?', a: 'Yes. We help existing schools integrate or strengthen Montessori practices.' },
  { q: 'Do you provide Montessori teacher training?', a: `Yes. We support teacher training and development, and our Primary Montessori Teacher Training starts in ${site.teacherTraining.startLabel}. <a href="/teach">Teach with us →</a>` },
  { q: 'Do you help with Montessori classroom setup?', a: 'Yes — thoughtful layouts and child-centred spaces that inspire.' },
  { q: 'Do you help with Montessori material selection and planning?', a: 'Yes — selecting, sourcing and making authentic, age-appropriate materials.' },
  { q: 'Do you provide curriculum planning?', a: 'Yes — an age-appropriate, authentic Montessori curriculum shaped around your children.' },
  { q: 'Can you help with school policies and documentation?', a: 'Yes — policies, procedures and handbooks.' },
  { q: 'Do you provide guidance on licensing and compliance?', a: 'Yes — NOC, recognition, affiliation and other statutory requirements.' },
  { q: 'How long does Montessori school setup consultancy take?', a: "It depends on where you're starting from. We'll map a clear timeline with you after our first conversation." },
  { q: 'Do you offer one-time consultancy or ongoing support?', a: 'Both: a one-time consultation, or ongoing mentorship and handholding.' },
  { q: 'Is Montessori consultancy only for new schools?', a: 'No. We also work with existing schools, educators, training institutes, and organisations and NGOs in education.' },
];

export const consultancyWa = wa(site.consultancy, waText.consultancy);

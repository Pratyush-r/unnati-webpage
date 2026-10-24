// Route-dependent bits of persisted elements (header, sheet, action bar, announcement).
// Persisted elements keep their DOM across navigations, so they are refreshed here after each swap.
import { site, telHref, wa, waText } from '../config/site';

export const path = () => location.pathname.replace(/\/$/, '') || '/';

/** The consultancy page uses the consultancy number; every other page uses the school number. */
export function contactFor(p = path()) {
  const consult = p === '/consultancy';
  const number = consult ? site.consultancy : site.school;
  return { tel: telHref(number), wa: wa(number, consult ? waText.consultancy : waText.general) };
}

/** Update every [data-contact="tel" | "wa"] link inside root. */
export function applyContact(root: ParentNode = document): void {
  const c = contactFor();
  root.querySelectorAll<HTMLAnchorElement>('[data-contact="tel"]').forEach((a) => (a.href = c.tel));
  root.querySelectorAll<HTMLAnchorElement>('[data-contact="wa"]').forEach((a) => (a.href = c.wa));
}

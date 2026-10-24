// Route-dependent bits of persisted elements (header, sheet, action bar, announcement).
// Persisted elements keep their DOM across navigations, so they are refreshed here after each swap.
import { site, telHref, wa, waText } from '../config/site';

export const path = () => location.pathname.replace(/\/$/, '') || '/';

/** One number everywhere; on /consultancy the WhatsApp message asks about consultancy. */
export function contactFor(p = path()) {
  return { tel: telHref(site.school), wa: wa(site.school, p === '/consultancy' ? waText.consultancy : waText.general) };
}

/** Update every [data-contact="tel" | "wa"] link inside root. */
export function applyContact(root: ParentNode = document): void {
  const c = contactFor();
  root.querySelectorAll<HTMLAnchorElement>('[data-contact="tel"]').forEach((a) => (a.href = c.tel));
  root.querySelectorAll<HTMLAnchorElement>('[data-contact="wa"]').forEach((a) => (a.href = c.wa));
}

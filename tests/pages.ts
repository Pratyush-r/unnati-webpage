// Shared test data.
import { activities } from '../src/content/at-home';

export const CONTENT_PAGES = ['/', '/about', '/approach', '/admissions', '/day-care', '/at-home', '/teach', '/consultancy', '/contact', '/privacy', '/404', '/pay', '/pay/mock-checkout', '/pay/confirmation'];
export const ACTIVITY_PAGES = activities.map((a) => `/at-home/${a.slug}`);
export const ALL_PAGES = [...CONTENT_PAGES, ...ACTIVITY_PAGES];
export const VIEWPORTS = [
  [320, 568], [360, 800], [390, 844], [412, 915], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
] as const;

export const slugOf = (p: string) => (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_'));

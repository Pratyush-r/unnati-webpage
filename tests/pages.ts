// Shared test data.
export const CONTENT_PAGES = ['/', '/about', '/approach', '/admissions', '/day-care', '/play', '/teach', '/consultancy', '/contact', '/privacy', '/404'];
export const GAME_PAGES = ['/play/set-the-table', '/play/knobbed-cylinders', '/play/sandpaper-letters', '/play/spindle-box', '/play/land-air-water'];
export const ALL_PAGES = [...CONTENT_PAGES, ...GAME_PAGES];
export const VIEWPORTS = [
  [320, 568], [360, 800], [390, 844], [412, 915], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
] as const;
export const GAME_EXTRA_VIEWPORTS = [[800, 360], [915, 412]] as const;
export const GAME_SLUGS = ['set-the-table', 'knobbed-cylinders', 'sandpaper-letters', 'spindle-box', 'land-air-water'];

/** Init script: mark "Show me" as already seen so it doesn't auto-play during tests. */
export const SKIP_SHOWME = `try { ${GAME_SLUGS.map((s) => `localStorage.setItem('unnati:showme:${s}','1');`).join('')} } catch (e) {}`;

export const slugOf = (p: string) => (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_'));

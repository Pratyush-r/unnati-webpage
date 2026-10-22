// Browser storage, wrapped so the site works with storage blocked (private mode, disabled site data).
type Area = 'local' | 'session';

function store(area: Area): Storage | null {
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getItem(key: string, area: Area = 'local'): string | null {
  try {
    return store(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string, area: Area = 'local'): void {
  try {
    store(area)?.setItem(key, value);
  } catch {
    /* storage blocked — ignore */
  }
}

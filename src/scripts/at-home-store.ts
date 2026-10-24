// Montessori at Home progress, kept only in this browser (brief 4.7.7). Nothing is sent anywhere.
import { getItem, setItem } from '../lib/storage';

function readList(key: string): string[] {
  try {
    const v = JSON.parse(getItem(key) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

const writeList = (key: string, list: string[]) => setItem(key, JSON.stringify([...new Set(list)]));

export const TRIED = 'unnati:tried';
export const HOME_READY = 'unnati:home-ready';
export const materialsKey = (slug: string) => `unnati:materials:${slug}`;

export const getList = readList;
export const setList = writeList;

export function toggleIn(key: string, id: string, on: boolean): string[] {
  const list = readList(key).filter((x) => x !== id);
  if (on) list.push(id);
  writeList(key, list);
  return list;
}

/** Show the "Tried" badge on every activity card on the page; returns how many are tried. */
export function markTriedCards(root: ParentNode = document): number {
  const tried = readList(TRIED);
  root.querySelectorAll<HTMLElement>('[data-activity]').forEach((card) => {
    const badge = card.querySelector<HTMLElement>('[data-tried-badge]');
    if (badge) badge.hidden = !tried.includes(card.dataset.activity!);
  });
  return tried.length;
}

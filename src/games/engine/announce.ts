// Polite live region for screen-reader announcements in games.
let region: HTMLElement | null = null;

export function announce(message: string): void {
  region ??= document.querySelector<HTMLElement>('[data-announce-region]');
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => {
    if (region) region.textContent = message;
  }, 30);
}

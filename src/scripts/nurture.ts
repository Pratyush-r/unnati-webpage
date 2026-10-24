// Tell Ankur the visitor did something meaningful (src/scripts/growth.ts listens and helps him grow).
// weight: 1 for an ordinary interaction, 2 for marking an activity as tried, 3 for sending an enquiry.
export function nurture(weight = 1): void {
  document.dispatchEvent(new CustomEvent('unnati:nurture', { detail: weight }));
}

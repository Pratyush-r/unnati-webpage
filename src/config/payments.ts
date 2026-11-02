// Online fee payments (prototype). Shared by the /pay pages and the payment API, so the browser and
// the server always agree on fee types and limits. Nothing secret lives here: keys go in .env.

/**
 * DEMO AMOUNTS ONLY. These are placeholders, not Unnati's fees. Replace them with the confirmed
 * fees before going live. `amount` prefills the form; the server accepts anything from `min` to `max`.
 */
export const feeTypes = {
  registration: { label: 'Registration fee', amount: 1000, min: 1, max: 50_000 },
  admission: { label: 'Admission fee', amount: 5000, min: 1, max: 2_00_000 },
  activity: { label: 'After-school activity fee', amount: 1500, min: 1, max: 50_000 },
} as const;

export type FeeType = keyof typeof feeTypes;
export const feeTypeIds = Object.keys(feeTypes) as FeeType[];
export const isFeeType = (v: unknown): v is FeeType => typeof v === 'string' && v in feeTypes;

export const payments = {
  currency: 'INR' as const,
  /** Shows "Pay fees" in the footer and on Admissions. Set to false to keep /pay unlinked. */
  linkFromSite: true,
};

/** ₹1,000 or ₹1,000.50 (Indian digit grouping). */
export function formatINR(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  }).format(rupees);
}

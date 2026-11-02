// Payment form validation. The same function runs in the browser (instant feedback) and on the
// server (the only check that counts), so the rules can't drift apart.
import { feeTypes, isFeeType, formatINR, type FeeType } from '../../config/payments';

export type PaymentFields = 'parentName' | 'childName' | 'email' | 'phone' | 'feeType' | 'amount';

export interface PaymentInput {
  parentName: string;
  childName: string;
  email: string;
  /** Normalised to +91XXXXXXXXXX. */
  phone: string;
  feeType: FeeType;
  /** Rupees, at most two decimals. */
  amount: number;
}

export type Validation =
  | { ok: true; value: PaymentInput }
  | { ok: false; errors: Partial<Record<PaymentFields, string>> };

const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Same rule as the enquiry form: an Indian mobile, with or without +91 / 0.
const MOBILE = /^(?:\+?91[\s-]?|0)?([6-9]\d{4})[\s-]?(\d{5})$/;

const text = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

export function validatePayment(raw: Record<string, unknown>): Validation {
  const errors: Partial<Record<PaymentFields, string>> = {};

  const parentName = text(raw.parentName);
  if (!parentName) errors.parentName = "Please add the parent's name.";
  else if (parentName.length < 2 || parentName.length > 80 || !NAME.test(parentName)) errors.parentName = 'Please use letters only (2 to 80 characters).';

  const childName = text(raw.childName);
  if (!childName) errors.childName = "Please add your child's name.";
  else if (childName.length > 80 || !NAME.test(childName)) errors.childName = 'Please use letters only (up to 80 characters).';

  const email = text(raw.email).toLowerCase();
  if (!email) errors.email = 'Please add an email address for the receipt.';
  else if (email.length > 254 || !EMAIL.test(email)) errors.email = 'Please check the email address, like name@example.com.';

  const phoneMatch = text(raw.phone).match(MOBILE);
  if (!text(raw.phone)) errors.phone = 'Please add a 10-digit mobile number.';
  else if (!phoneMatch) errors.phone = 'Please add a 10-digit mobile number, like 98765 43210.';

  const feeType = raw.feeType;
  if (!isFeeType(feeType)) errors.feeType = 'Please choose what you are paying for.';

  const amountText = typeof raw.amount === 'number' ? String(raw.amount) : text(raw.amount).replace(/[₹,\s]/g, '');
  const amount = Number(amountText);
  if (!amountText) errors.amount = 'Please enter the amount.';
  else if (!/^\d+(\.\d{1,2})?$/.test(amountText) || !Number.isFinite(amount)) errors.amount = 'Please enter the amount in rupees, like 1500.';
  else if (isFeeType(feeType)) {
    const { min, max } = feeTypes[feeType];
    if (amount < min || amount > max) errors.amount = `Please enter an amount from ${formatINR(min)} to ${formatINR(max)}.`;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      parentName, childName, email,
      phone: `+91${phoneMatch![1]}${phoneMatch![2]}`,
      feeType: feeType as FeeType,
      amount,
    },
  };
}

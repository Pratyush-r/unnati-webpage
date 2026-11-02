// Payment service: picks the provider named by PAYMENT_PROVIDER and runs the order lifecycle.
// Server only (the payment API and build time). The browser only ever sees publicOrder().
// Settings come from process.env: .env locally (loaded in astro.config.mjs), Netlify env vars live.
import { randomBytes, randomUUID } from 'node:crypto';
import { feeTypes, payments } from '../../config/payments';
import type { PaymentInput } from './validate';
import type { Order, PaymentOutcome, PaymentProvider, ProviderConfig } from './types';
import { createStore } from './store';
import createMockProvider from './providers/mock';

// One line per gateway adapter in ./providers/. The id is the PAYMENT_PROVIDER value.
// REPLACE WITH REAL GATEWAY: import your adapter above and add it here, e.g. razorpay: createRazorpayProvider.
const factories: Record<string, (config: ProviderConfig) => PaymentProvider> = {
  mock: createMockProvider,
};

const env = (name: string) => process.env[name] || undefined;

let provider: PaymentProvider | undefined;

export function getProvider(): PaymentProvider {
  if (provider) return provider;
  const id = (env('PAYMENT_PROVIDER') ?? 'mock').toLowerCase();
  const factory = factories[id];
  if (!factory) throw new Error(`PAYMENT_PROVIDER="${id}" has no adapter in src/lib/payments/providers/ (have: ${Object.keys(factories).join(', ')}).`);
  provider = factory({
    keyId: env('PAYMENT_KEY_ID'),
    keySecret: env('PAYMENT_KEY_SECRET'),
    webhookSecret: env('PAYMENT_WEBHOOK_SECRET'),
  });
  return provider;
}

export const store = createStore(env('PAYMENT_STORE_FILE'));

/** Pages show the "Demo mode" banner while the mock provider is selected. */
export const isDemo = () => getProvider().demo;

const REF_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O or 1/I, easy to read out on the phone

function newReference(now: Date): string {
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');
  const tail = [...randomBytes(6)].map((b) => REF_CHARS[b % REF_CHARS.length]).join('');
  return `UNM-${date}-${tail}`;
}

/** Create the order locally, then at the gateway. Returns where to send the parent. */
export async function startPayment(input: PaymentInput, origin: string) {
  const gateway = getProvider();
  const now = new Date();
  const order: Order = {
    ...input,
    id: randomUUID(),
    reference: newReference(now),
    amountPaise: Math.round(input.amount * 100),
    currency: payments.currency,
    status: 'created',
    provider: gateway.id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const returnUrl = `${origin}/api/payments/return?order=${order.id}`;
  const result = await gateway.createOrder(order, { returnUrl, webhookUrl: `${origin}/api/payments/webhook` });
  order.gatewayOrderId = result.gatewayOrderId;
  await store.put(order);
  return { order, checkout: result.checkout };
}

/** Record an outcome. A paid order stays paid, whatever arrives later. */
export async function applyOutcome(order: Order, outcome: PaymentOutcome): Promise<Order> {
  if (order.status === 'paid') return order;
  return store.put({
    ...order,
    status: outcome.status,
    gatewayPaymentId: outcome.gatewayPaymentId ?? order.gatewayPaymentId,
    failureReason: outcome.status === 'paid' ? undefined : outcome.failureReason,
    updatedAt: new Date().toISOString(),
  });
}

/** What the confirmation page may show. No email, phone or gateway ids. */
export function publicOrder(order: Order) {
  return {
    reference: order.reference,
    status: order.status,
    feeType: order.feeType,
    feeLabel: feeTypes[order.feeType].label,
    amount: order.amountPaise / 100,
    parentName: order.parentName,
    childName: order.childName,
    failureReason: order.failureReason,
    demo: getProvider().demo,
    updatedAt: order.updatedAt,
  };
}

export type PublicOrder = ReturnType<typeof publicOrder>;

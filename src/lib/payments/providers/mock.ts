// MockProvider: a pretend gateway for the prototype. No money moves and nothing leaves this server.
// It behaves like a real hosted checkout so the rest of the flow is exercised end to end:
//   createOrder   → sends the parent to our own /pay/mock-checkout page (a real gateway hosts this)
//   verifyPayment → checks a signed token, as a real gateway's return signature would be checked
//   handleWebhook → accepts a JSON event signed with HMAC-SHA256 in the x-mock-signature header
//
// To add a real gateway, copy this file to ./razorpay.ts (or cashfree.ts, payu.ts…), implement the
// same three methods with that gateway's API, register it in ../index.ts (one line) and set
// PAYMENT_PROVIDER=razorpay. The pages and the API routes don't change.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { PaymentProvider, ProviderConfig, PaymentOutcome } from '../types';
import { WebhookError } from '../types';

// Signs mock tokens only. Not a credential: the mock can't take real payments whatever this is.
const FALLBACK_SIGNING_VALUE = 'unnati-mock-gateway';

const OUTCOMES: Record<string, PaymentOutcome['status']> = { success: 'paid', failed: 'failed', cancelled: 'cancelled' };

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export default function createMockProvider(config: ProviderConfig): PaymentProvider {
  const secret = config.keySecret || FALLBACK_SIGNING_VALUE;
  const webhookSecret = config.webhookSecret || secret;
  const sign = (value: string, key = secret) => createHmac('sha256', key).update(value).digest('hex');

  return {
    id: 'mock',
    demo: true,

    async createOrder(order, ctx) {
      // REPLACE WITH REAL GATEWAY: call the gateway's "create order" API with order.amountPaise,
      // order.currency and order.reference, plus ctx.returnUrl / ctx.webhookUrl where it takes them.
      const gatewayOrderId = `mock_order_${randomBytes(8).toString('hex')}`;
      const params = new URLSearchParams({
        order: order.id,
        token: sign(gatewayOrderId),
        return: new URL(ctx.returnUrl).pathname + new URL(ctx.returnUrl).search,
      });
      return { gatewayOrderId, checkout: { type: 'redirect', url: `/pay/mock-checkout?${params}` } };
    },

    async verifyPayment(request, order) {
      // REPLACE WITH REAL GATEWAY: verify the gateway's return signature (e.g. HMAC of order id +
      // payment id with the key secret) or fetch the payment status from the gateway's API.
      const url = new URL(request.url);
      const form = request.method === 'POST' ? await request.formData() : url.searchParams;
      const outcome = OUTCOMES[String(form.get('mock_outcome') ?? '')];
      const token = String(form.get('mock_token') ?? '');
      if (!order.gatewayOrderId || !outcome || !safeEqual(token, sign(order.gatewayOrderId))) {
        return { status: 'failed', failureReason: 'The payment could not be verified.' };
      }
      if (outcome === 'cancelled') return { status: 'cancelled', failureReason: 'The payment was cancelled.' };
      const gatewayPaymentId = `mock_pay_${randomBytes(8).toString('hex')}`;
      if (outcome === 'failed') return { status: 'failed', gatewayPaymentId, failureReason: 'The demo bank declined this payment.' };
      return { status: 'paid', gatewayPaymentId };
    },

    async handleWebhook(request) {
      // REPLACE WITH REAL GATEWAY: verify the gateway's webhook signature header with
      // PAYMENT_WEBHOOK_SECRET, then map its event (e.g. payment.captured) to a WebhookEvent.
      const body = await request.text();
      const signature = request.headers.get('x-mock-signature') ?? '';
      if (!safeEqual(signature, sign(body, webhookSecret))) throw new WebhookError('Bad signature');
      const event = JSON.parse(body) as { gatewayOrderId?: unknown; status?: unknown; gatewayPaymentId?: unknown };
      const status = event.status as PaymentOutcome['status'];
      if (typeof event.gatewayOrderId !== 'string' || !['paid', 'failed', 'cancelled'].includes(status)) return null;
      return {
        gatewayOrderId: event.gatewayOrderId,
        status,
        gatewayPaymentId: typeof event.gatewayPaymentId === 'string' ? event.gatewayPaymentId : undefined,
      };
    },
  };
}

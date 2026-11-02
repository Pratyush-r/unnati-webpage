// The payment provider contract. The /pay pages and the API routes only talk to this interface,
// so a real gateway is one new file in ./providers/ that implements it, registered with one line in
// ./index.ts (see README "Payments (prototype)").
import type { PaymentInput } from './validate';

export type OrderStatus = 'created' | 'paid' | 'failed' | 'cancelled';

/** One fee payment, as kept in the order store. No card or bank details, ever. */
export interface Order extends PaymentInput {
  /** Our id, used in URLs. Random and unguessable. */
  id: string;
  /** Shown to the parent and quoted to the school, e.g. UNM-261101-7KQ3XD. */
  reference: string;
  /** Integer paise (₹1 = 100), the unit every Indian gateway uses. */
  amountPaise: number;
  currency: 'INR';
  status: OrderStatus;
  provider: string;
  /** The gateway's own order id, set by createOrder. */
  gatewayOrderId?: string;
  /** The gateway's payment / transaction id, set once a payment is attempted. */
  gatewayPaymentId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** Where to send the parent to pay. Covers both hosted-checkout styles Indian gateways use. */
export type CheckoutAction =
  | { type: 'redirect'; url: string }
  /** The browser auto-submits these fields to `url` (e.g. a hosted form that expects a POST). */
  | { type: 'form-post'; url: string; fields: Record<string, string> };

export interface CreateOrderContext {
  /** Gateway sends the parent back here after paying (GET or POST). Already carries ?order=<id>. */
  returnUrl: string;
  /** Gateway calls this server-to-server with payment events. */
  webhookUrl: string;
}

export interface CreateOrderResult {
  gatewayOrderId: string;
  checkout: CheckoutAction;
}

/** The outcome of a payment, as the gateway reports it. */
export interface PaymentOutcome {
  status: Exclude<OrderStatus, 'created'>;
  gatewayPaymentId?: string;
  failureReason?: string;
}

export interface WebhookEvent extends PaymentOutcome {
  gatewayOrderId: string;
}

export interface PaymentProvider {
  /** Matches PAYMENT_PROVIDER, e.g. 'mock' or 'razorpay'. */
  readonly id: string;
  /** True only for the mock: pages show the demo banner. */
  readonly demo: boolean;
  /** Create the order at the gateway and say where the parent should go to pay. */
  createOrder(order: Order, ctx: CreateOrderContext): Promise<CreateOrderResult>;
  /**
   * The parent has come back to returnUrl. Check the gateway's signature or ask the gateway for the
   * real status. Never trust the browser's word that a payment succeeded.
   */
  verifyPayment(request: Request, order: Order): Promise<PaymentOutcome>;
  /**
   * A server-to-server event from the gateway. Verify its signature; return null to ignore an
   * event type you don't need. Throw WebhookError for a bad signature.
   */
  handleWebhook(request: Request): Promise<WebhookEvent | null>;
}

export class WebhookError extends Error {}

/** Settings read from the environment (.env locally, Netlify environment variables in production). */
export interface ProviderConfig {
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
}

// The payment API as one standard Request → Response handler, so it runs anywhere unchanged:
//   production   netlify/functions/payments.mts (a Netlify Function at /api/payments/*)
//   npm run dev / npm run preview   src/integrations/payments-api.mjs
//
//   POST /api/payments/orders       validate the form, create the order, return where to pay
//   GET  /api/payments/orders/:id   an order's public view (confirmation and mock checkout pages)
//   GET|POST /api/payments/return   the gateway sends the parent back here; verify, then confirmation
//   POST /api/payments/webhook      server-to-server events from the gateway
import { validatePayment } from './validate';
import { applyOutcome, getProvider, publicOrder, startPayment, store } from './index';
import { WebhookError } from './types';

const MAX_BODY = 10_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const noStore = { 'Cache-Control': 'no-store' };

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: noStore });

async function createOrder(request: Request, origin: string): Promise<Response> {
  // JSON only: a cross-site <form> can't send it, which keeps other sites from creating orders here.
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Send JSON.' }, 415);
  const body = await request.text();
  if (body.length > MAX_BODY) return json({ error: 'Too large.' }, 413);
  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return json({ error: 'Invalid request.' }, 400);

  const result = validatePayment(raw as Record<string, unknown>);
  if (!result.ok) return json({ errors: result.errors }, 422);
  try {
    const { order, checkout } = await startPayment(result.value, origin);
    return json({ orderId: order.id, reference: order.reference, checkout }, 201);
  } catch (err) {
    console.error('[payments] createOrder failed', err);
    return json({ error: 'We could not start the payment. Please try again.' }, 502);
  }
}

async function getOrder(id: string): Promise<Response> {
  const order = UUID.test(id) ? await store.get(id) : undefined;
  return order ? json(publicOrder(order)) : json({ error: 'Order not found.' }, 404);
}

async function paymentReturn(request: Request, id: string): Promise<Response> {
  const order = UUID.test(id) ? await store.get(id) : undefined;
  if (order) {
    try {
      await applyOutcome(order, await getProvider().verifyPayment(request, order));
    } catch (err) {
      console.error('[payments] verifyPayment failed', err);
      await applyOutcome(order, { status: 'failed', failureReason: 'The payment could not be verified.' });
    }
  }
  // 303 so the browser loads the confirmation page with GET, even after a POST from the gateway.
  return new Response(null, { status: 303, headers: { ...noStore, Location: `/pay/confirmation/?order=${encodeURIComponent(id)}` } });
}

async function webhook(request: Request): Promise<Response> {
  try {
    const event = await getProvider().handleWebhook(request);
    if (!event) return json({ received: true, ignored: true });
    const order = await store.findByGatewayOrderId(event.gatewayOrderId);
    if (!order) return json({ received: true, matched: false });
    const updated = await applyOutcome(order, event);
    return json({ received: true, status: updated.status });
  } catch (err) {
    if (err instanceof WebhookError) return json({ error: 'Invalid signature.' }, 401);
    console.error('[payments] webhook failed', err);
    return json({ error: 'Webhook failed.' }, 400);
  }
}

export async function handlePaymentsRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;

  if (path === '/api/payments/orders' && method === 'POST') return createOrder(request, url.origin);
  const match = path.match(/^\/api\/payments\/orders\/([^/]+)$/);
  if (match && method === 'GET') return getOrder(decodeURIComponent(match[1]));
  if (path === '/api/payments/return' && (method === 'GET' || method === 'POST')) return paymentReturn(request, url.searchParams.get('order') ?? '');
  if (path === '/api/payments/webhook' && method === 'POST') return webhook(request);
  return json({ error: 'Not found.' }, 404);
}

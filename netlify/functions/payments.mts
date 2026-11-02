// The payment API in production: a Netlify Function answering every /api/payments/* request.
// All the logic is in src/lib/payments/http.ts, shared with the local dev and preview servers.
// Environment variables (PAYMENT_PROVIDER, PAYMENT_KEY_ID, …) are set in the Netlify dashboard.
import { handlePaymentsRequest } from '../../src/lib/payments/http';

export default (request: Request) => handlePaymentsRequest(request);

export const config = { path: '/api/payments/*' };

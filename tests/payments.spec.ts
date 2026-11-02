// Pay fees prototype: form validation, order summary, the mock checkout's three outcomes,
// the confirmation page, and the API's own checks (server validation, return tokens, webhook signatures).
import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';

const PARENT = { parentName: 'Priya Raman', childName: 'Aarav', email: 'p@example.com', phone: '9876543210' };

async function fillDetails(page: Page) {
  await page.goto('/pay');
  await page.fill('#pay-parent', 'Priya Raman');
  await page.fill('#pay-child', 'Aarav');
  await page.fill('#pay-email', 'priya@example.com');
  await page.fill('#pay-phone', '98765 43210');
  await page.selectOption('#pay-fee', 'registration');
}

async function payWith(page: Page, outcome: 'Success' | 'Failed' | 'Cancelled') {
  await fillDetails(page);
  await page.getByRole('button', { name: 'Review payment' }).click();
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page.waitForURL(/\/pay\/mock-checkout/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mock checkout');
  await expect(page.locator('[data-co="amount"]')).toHaveText('₹1,000');
  await page.getByRole('button', { name: outcome, exact: true }).click();
  await page.waitForURL(/\/pay\/confirmation/);
}

test('demo banner and noindex on every payment page', async ({ page }) => {
  for (const path of ['/pay', '/pay/mock-checkout', '/pay/confirmation']) {
    await page.goto(path);
    await expect(page.locator('[data-demo-banner]'), path).toContainText('Demo mode, no real payments are processed');
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', 'noindex');
  }
});

test('the form reports every problem and focuses the first', async ({ page }) => {
  await page.goto('/pay');
  await page.fill('#pay-email', 'not-an-email');
  await page.fill('#pay-phone', '12345');
  await page.getByRole('button', { name: 'Review payment' }).click();
  await expect(page.locator('#pay-parent-err')).toContainText("parent's name");
  await expect(page.locator('#pay-email-err')).toContainText('check the email');
  await expect(page.locator('#pay-phone-err')).toContainText('10-digit');
  await expect(page.locator('#pay-fee-err')).toContainText('Please choose');
  await expect(page.locator('#pay-parent')).toBeFocused();
  await expect(page.locator('[data-step="summary"]')).toBeHidden();
});

test('choosing a fee prefills the amount; out-of-range amounts are refused', async ({ page }) => {
  await fillDetails(page);
  await expect(page.locator('#pay-amount')).toHaveValue('1000');
  await page.selectOption('#pay-fee', 'activity');
  await expect(page.locator('#pay-amount')).toHaveValue('1500');
  await page.fill('#pay-amount', '0');
  await page.getByRole('button', { name: 'Review payment' }).click();
  await expect(page.locator('#pay-amount-err')).toContainText('from ₹1 to ₹50,000');
});

test('order summary shows the details and can go back to edit', async ({ page }) => {
  await fillDetails(page);
  await page.getByRole('button', { name: 'Review payment' }).click();
  const summary = page.locator('[data-step="summary"]');
  await expect(summary).toContainText('Priya Raman');
  await expect(summary).toContainText('+91 98765 43210');
  await expect(summary).toContainText('Registration fee');
  await expect(summary.locator('[data-sum="amount"]')).toHaveText('₹1,000');
  await page.getByRole('button', { name: 'Edit details' }).click();
  await expect(page.locator('#pay-parent')).toBeFocused();
  await expect(page.locator('#pay-parent')).toHaveValue('Priya Raman');
});

test('success: confirmation shows Paid and a reference number', async ({ page }) => {
  await payWith(page, 'Success');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Payment successful');
  await expect(page.locator('.ref')).toHaveText(/^UNM-\d{6}-[2-9A-HJ-NP-Z]{6}$/);
  await expect(page.locator('[data-f="statusLabel"]')).toHaveText('Paid');
  await expect(page.locator('[data-retry]')).toBeHidden();
});

test('failed: confirmation explains and offers Try again', async ({ page }) => {
  await payWith(page, 'Failed');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Payment failed');
  await expect(page.locator('[data-f="statusLabel"]')).toHaveText('Failed');
  await expect(page.locator('[data-retry]')).toBeVisible();
});

test('cancelled: confirmation says nothing was paid', async ({ page }) => {
  await payWith(page, 'Cancelled');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Payment cancelled');
  await expect(page.locator('[data-f="statusLabel"]')).toHaveText('Cancelled');
});

test('an unknown order shows a friendly message', async ({ page }) => {
  await page.goto('/pay/confirmation/?order=00000000-0000-0000-0000-000000000000');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("We couldn't find this payment");
});

test('API: the server validates on its own and needs JSON', async ({ request }) => {
  const bad = await request.post('/api/payments/orders', { data: { parentName: 'P', feeType: 'admission', amount: '99999999' } });
  expect(bad.status()).toBe(422);
  const { errors } = await bad.json();
  expect(Object.keys(errors).sort()).toEqual(['amount', 'childName', 'email', 'parentName', 'phone']);
  const form = await request.post('/api/payments/orders', { form: { parentName: 'Priya' } });
  expect(form.status()).toBe(415);
});

test('API: a forged return token never marks an order paid', async ({ request }) => {
  const res = await request.post('/api/payments/orders', { data: { ...PARENT, feeType: 'admission', amount: 5000 } });
  expect(res.status()).toBe(201);
  const { orderId } = await res.json();
  await request.post(`/api/payments/return?order=${orderId}`, { form: { mock_outcome: 'success', mock_token: 'forged' }, maxRedirects: 0 });
  const order = await (await request.get(`/api/payments/orders/${orderId}`)).json();
  expect(order.status).toBe('failed');
  // The public view never carries contact details.
  expect(order).not.toHaveProperty('email');
  expect(order).not.toHaveProperty('phone');
});

test('API: webhooks need a valid signature', async ({ request }) => {
  const unsigned = await request.post('/api/payments/webhook', { data: { gatewayOrderId: 'x', status: 'paid' } });
  expect(unsigned.status()).toBe(401);

  // A correctly signed event (mock's default signing value, used when no PAYMENT_*_SECRET is set).
  test.skip(Boolean(process.env.PAYMENT_KEY_SECRET || process.env.PAYMENT_WEBHOOK_SECRET), 'custom secret set');
  const body = JSON.stringify({ gatewayOrderId: 'mock_order_unknown', status: 'paid' });
  const signed = await request.post('/api/payments/webhook', {
    headers: { 'content-type': 'application/json', 'x-mock-signature': createHmac('sha256', 'unnati-mock-gateway').update(body).digest('hex') },
    data: body,
  });
  expect(signed.status()).toBe(200);
  expect(await signed.json()).toEqual({ received: true, matched: false });
});

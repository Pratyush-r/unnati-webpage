// Enquiry → WhatsApp hand-off.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url));
      return null;
    }) as typeof window.open;
  });
});

test('invalid mobile number shows a friendly error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#enq-name', 'Priya');
  await page.fill('#enq-mobile', '12345');
  await page.click('form[data-form] button[type="submit"]');
  await expect(page.locator('#enq-mobile-err')).toHaveText(/10-digit mobile number/);
  await expect(page.locator('#enq-mobile')).toBeFocused();
  await expect(page.locator('#enq-mobile')).toHaveAttribute('aria-invalid', 'true');
  expect(await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.length)).toBe(0);
});

test('missing name is reported first', async ({ page }) => {
  await page.goto('/admissions');
  await page.click('form[data-form] button[type="submit"]');
  await expect(page.locator('#enq-name-err')).toContainText('Please add your name');
  await expect(page.locator('#enq-name')).toBeFocused();
});

test('valid enquiry opens the exact wa.me URL and shows the success state', async ({ page }) => {
  await page.goto('/');
  await page.fill('#enq-name', 'Priya Raman');
  await page.fill('#enq-mobile', '+91 98765 43210');
  await page.selectOption('#enq-age', '3–4');
  await page.check('input[value="Primary Environment"]', { force: true });
  await page.check('input[value="Extended Day Care"]', { force: true });
  await page.fill('#enq-msg', 'Can we visit on Saturday?');
  await page.click('form[data-form] button[type="submit"]');

  const message = [
    "Hello Unnati Montessori! I'd like to know more.",
    'Parent: Priya Raman',
    'Mobile: +91 98765 43210',
    "Child's age: 3–4",
    'Interested in: Primary Environment, Extended Day Care',
    'Can we visit on Saturday?',
  ].join('\n');
  const expected = `https://wa.me/917550022403?text=${encodeURIComponent(message)}`;
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  expect(opened).toEqual([expected]);

  await expect(page.locator('[data-success]')).toBeVisible();
  await expect(page.locator('[data-success]')).toContainText('Your message is ready in WhatsApp — just press send.');
  await expect(page.locator('[data-wa-again]')).toHaveAttribute('href', expected);
  await expect(page.locator('[data-form-wrap]')).toBeHidden();
});

test('day care page pre-selects Extended Day Care', async ({ page }) => {
  await page.goto('/day-care');
  await expect(page.locator('input[value="Extended Day Care"]')).toBeChecked();
});

test('touch devices hand off with location.href', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  let navigated = '';
  await page.route('https://wa.me/**', (route) => {
    navigated = route.request().url();
    return route.fulfill({ status: 200, body: 'ok' });
  });
  await page.goto('/contact');
  await page.fill('#enq-name', 'Arun');
  await page.fill('#enq-mobile', '9876543210');
  await page.locator('form[data-form] button[type="submit"]').tap();
  await expect.poll(() => navigated).toContain('https://wa.me/917550022403?text=');
  expect(decodeURIComponent(navigated.split('text=')[1])).toContain('Parent: Arun');
  await context.close();
});

test('every WhatsApp link says WhatsApp and every phone is a tel: link', async ({ page }) => {
  for (const path of ['/', '/day-care', '/teach', '/consultancy', '/contact']) {
    await page.goto(path);
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]'))
        .filter((a) => !/whatsapp/i.test(a.textContent || ''))
        .map((a) => a.outerHTML.slice(0, 120)),
    );
    expect(bad, path).toEqual([]);
    const phones = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href')),
    );
    expect(phones.every((h) => h === 'tel:+917550022403' || h === 'tel:+919003584303')).toBe(true);
  }
  await page.goto('/consultancy');
  const consultWa = await page.locator('main a[href^="https://wa.me/"]').first().getAttribute('href');
  expect(consultWa).toContain('wa.me/919003584303');
});

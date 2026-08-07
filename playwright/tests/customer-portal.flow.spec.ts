import { expect, test } from '@playwright/test';

async function registerAndLogin(page: import('@playwright/test').Page) {
  const stamp = Date.now();
  const email = `flow${stamp}@satset.test`;
  const phone = `08221${String(stamp).slice(-6)}`;
  const password = 'rahasia123';

  await page.goto('http://127.0.0.1:3200/customer/register');
  await page.locator('#reg-name').fill('Flow Customer');
  await page.locator('#reg-email').fill(email);
  await page.locator('#reg-phone').fill(phone);
  await page.locator('#reg-password').fill(password);
  await page.locator('#register-form').getByRole('button', { name: 'Daftar' }).click();
  await expect(page).toHaveURL(/\/customer\/login$/);

  await page.locator('#login-identifier').fill(email);
  await page.locator('#login-password').fill(password);
  await page.locator('#login-form').getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/customer\/dashboard$/);
}

test.describe('customer portal flow', () => {
  test.beforeEach(async ({ page }) => {
    await expect
      .poll(async () => {
        try {
          const response = await page.request.get('http://127.0.0.1:3200/customer');
          return response.status();
        } catch {
          return 0;
        }
      }, { timeout: 20_000 })
      .toBe(200);

    await expect
      .poll(async () => {
        try {
          const response = await page.request.get('http://127.0.0.1:3001/health');
          return response.status();
        } catch {
          return 0;
        }
      }, { timeout: 20_000 })
      .toBe(200);
  });

  test('outbound wizard pending payment then cancel', async ({ page }) => {
    await registerAndLogin(page);

    await page.goto('http://127.0.0.1:3200/customer/booking');
    await page.getByRole('button', { name: 'Outbound' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-date').fill('2030-01-03');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    const slot = page.locator('.slot-btn:not(.full)').first();
    await slot.click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-package').selectOption('pro');
    await page.locator('#wiz-participants').fill('5');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-promo').fill('OUTBOUND50');
    await page.locator('#wiz-promo-apply').click();
    await expect(page.locator('#wiz-totals')).toContainText('Diskon');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-pay-gateway').selectOption('midtrans');
    await page.locator('#wiz-pay-method').selectOption('virtual-account');
    await page.locator('#wiz-booking-submit').click();

    await expect(page).toHaveURL(/\/customer\/ticket\/.+/);
    await expect(page.locator('#ticket-detail')).toContainText('PENDING');

    const bookingId = page.url().split('/').pop();
    await page.goto('http://127.0.0.1:3200/customer/payment');
    await page.locator('#payment-booking-id').fill(String(bookingId));
    await page.locator('#pay-refresh-btn').click();
    await expect(page.locator('#payment-status-pill')).toContainText('PENDING');

    await page.locator('#pay-cancel-btn').click();
    await expect(page.locator('#payment-status-pill')).toContainText('CANCELLED');
  });

  test('cafe wizard with promo and history filter', async ({ page }) => {
    await registerAndLogin(page);

    await page.goto('http://127.0.0.1:3200/customer/booking');
    await page.getByRole('button', { name: 'Cafe' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-date').fill('2030-01-04');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    const slot = page.locator('.slot-btn:not(.full)').first();
    await slot.click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-participants').fill('4');
    await page.locator('#wiz-area').selectOption('outdoor');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-promo').fill('CAFE20');
    await page.locator('#wiz-promo-apply').click();
    await expect(page.locator('#wiz-totals')).toContainText('Grand Total');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-pay-gateway').selectOption('sandbox');
    await page.locator('#wiz-pay-method').selectOption('virtual-account');
    await page.locator('#wiz-booking-submit').click();

    await expect(page).toHaveURL(/\/customer\/ticket\/.+/);
    await expect(page.locator('#ticket-detail')).toContainText('PAID');

    await page.goto('http://127.0.0.1:3200/customer/history');
    await page.locator('#history-type').selectOption('cafe');
    await page.locator('#history-status').selectOption('paid');
    await page.locator('#history-filter-btn').click();
    await expect(page.locator('#history-body')).toContainText('cafe');
  });
});

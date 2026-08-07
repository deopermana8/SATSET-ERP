import { expect, test } from '@playwright/test';

test.describe('customer portal smoke', () => {
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

  test('@smoke customer landing renders sections', async ({ page }) => {
    await page.goto('http://127.0.0.1:3200/customer');

    await expect(page.getByText('SATSET Customer Portal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Booking Wizard SATSET untuk Tiket, Outbound, dan Cafe' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paket Wisata' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paket Outbound' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cafe', exact: true })).toBeVisible();
  });

  test('@smoke customer register login booking payment flow', async ({ page }) => {
    const stamp = Date.now();
    const email = `customer${stamp}@satset.test`;
    const phone = `08123${String(stamp).slice(-6)}`;
    const password = 'rahasia123';

    await page.goto('http://127.0.0.1:3200/customer/register');
    await page.locator('#reg-name').fill('Customer Smoke');
    await page.locator('#reg-email').fill(email);
    await page.locator('#reg-phone').fill(phone);
    await page.locator('#reg-password').fill(password);
    await page.locator('#register-form').getByRole('button', { name: 'Daftar' }).click();
    await expect(page).toHaveURL(/\/customer\/login$/);

    await page.locator('#login-identifier').fill(email);
    await page.locator('#login-password').fill(password);
    await page.locator('#login-form').getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/customer\/dashboard$/);

    await page.goto('http://127.0.0.1:3200/customer/booking');

    await page.getByRole('button', { name: 'Tiket' }).click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-date').fill('2030-01-02');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    const availableSlot = page.locator('.slot-btn:not(.full)').first();
    await expect(availableSlot).toBeVisible();
    await availableSlot.click();
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-adults').fill('1');
    await page.locator('#wiz-children').fill('0');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-promo').fill('HEMAT10');
    await page.locator('#wiz-promo-apply').click();
    await expect(page.locator('#wiz-totals')).toContainText('Grand Total');
    await page.getByRole('button', { name: 'Berikutnya' }).click();

    await page.locator('#wiz-pay-gateway').selectOption('sandbox');
    await page.locator('#wiz-pay-method').selectOption('virtual-account');
    await page.locator('#wiz-booking-submit').click();

    await expect(page).toHaveURL(/\/customer\/ticket\/.+/);
    await expect(page.locator('#ticket-detail')).toContainText('Status:');
    await expect(page.locator('#ticket-detail')).toContainText('PAID');
  });

  test('@smoke customer history and profile route load', async ({ page }) => {
    await page.goto('http://127.0.0.1:3200/customer/history');
    await expect(page).toHaveURL(/\/customer\/login$/);

    await page.goto('http://127.0.0.1:3200/customer/profile');
    await expect(page).toHaveURL(/\/customer\/login$/);
  });

  test('@smoke customer login logout route guard', async ({ page }) => {
    const stamp = Date.now();
    const email = `logout${stamp}@satset.test`;
    const phone = `08921${String(stamp).slice(-6)}`;
    const password = 'rahasia123';

    await page.goto('http://127.0.0.1:3200/customer/register');
    await page.locator('#reg-name').fill('Customer Logout');
    await page.locator('#reg-email').fill(email);
    await page.locator('#reg-phone').fill(phone);
    await page.locator('#reg-password').fill(password);
    await page.locator('#register-form').getByRole('button', { name: 'Daftar' }).click();
    await expect(page).toHaveURL(/\/customer\/login$/);

    await page.locator('#login-identifier').fill(email);
    await page.locator('#login-password').fill(password);
    await page.locator('#login-form').getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/customer\/dashboard$/);

    await page.locator('#header-auth-btn').click();
    await expect(page).toHaveURL(/\/customer\/login$/);

    await page.goto('http://127.0.0.1:3200/customer/history');
    await expect(page).toHaveURL(/\/customer\/login$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/customer\/login$/);
  });
});

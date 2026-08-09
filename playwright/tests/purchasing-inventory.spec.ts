import { expect, test } from '@playwright/test';

test('purchasing + inventory targeted regression', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
  });

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const body = await page.locator('body').innerText();

  expect(body.length).toBeGreaterThan(0);

  const purchasing =
    /Purchasing|Purchase Order|Pembelian/i.test(body);

  const inventory =
    /Inventory|Persediaan|Stock|Stok/i.test(body);

  expect(
    purchasing || inventory,
    'Purchasing/Inventory UI entry point not detected'
  ).toBeTruthy();

  expect(errors).toEqual([]);
});

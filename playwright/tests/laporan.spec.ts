import { expect, test } from '@playwright/test';
import { baselineScreenshotPath, captureErrors, clickSidebarSectionItem, closeModalIfOpen, expectElementScreenshotMatchesBaseline, snapshotState, waitForRuntimeReady } from '../utils/runtime.js';

const listReportItems = [
  { label: 'Ticket', expectedTitle: 'ticketing' },
  { label: 'Booking', expectedTitle: 'reservasi' },
  { label: 'Cafe', expectedTitle: 'Cafe' },
  { label: 'Outbound', expectedTitle: 'Outbound' },
  { label: 'Finance', expectedTitle: 'Keuangan Inti' },
];

test('laporan sidebar group regression', async ({ page }) => {
  const errors = captureErrors(page);

  await page.goto('/');
  await waitForRuntimeReady(page);

  const reportResponse = page.waitForResponse((response) => {
    return response.request().method() === 'GET' && response.url().includes('/api/erp-wisata/report');
  });

  await clickSidebarSectionItem(page, 'Laporan', 'ERP Wisata');
  await closeModalIfOpen(page);
  const initialReportResponse = await reportResponse;
  expect(initialReportResponse.status()).toBe(200);

  await expect(page.locator('#v-report')).toHaveClass(/on/);
  await expect(page.locator('#report-load')).toBeEnabled();
  await expect(page.locator('#report-operational')).toContainText('{');
  await expect(page.locator('#report-financial')).toContainText('{');
  await expect(page.locator('#report-reservation')).toContainText('{');

  const reportFilterResponse = page.waitForResponse((response) => {
    return response.request().method() === 'GET'
      && response.url().includes('/api/erp-wisata/report')
      && response.url().includes('from=')
      && response.url().includes('to=');
  });
  await page.locator('#report-from').fill('2099-01-01');
  await page.locator('#report-to').fill('2099-01-01');
  await page.locator('#report-load').click();
  const filteredReportResponse = await reportFilterResponse;
  expect(filteredReportResponse.status()).toBe(200);
  await expect(page.locator('#report-empty')).toBeVisible();

  await page.locator('#report-from').fill('2099-02-01');
  await page.locator('#report-to').fill('2099-01-01');
  await page.locator('#report-load').click();
  await expect(page.locator('#report-state')).toContainText('Filter periode tidak valid');

  for (const item of listReportItems) {
    await clickSidebarSectionItem(page, 'Laporan', item.label);
    await closeModalIfOpen(page);
    const state = await snapshotState(page);
    expect(state.moduleTitle).toBe(item.expectedTitle);
    expect(state.moduleSubtitle).not.toBe('');
    expect(state.moduleShowcaseCount).toBeGreaterThan(0);
    expect(state.moduleQuickActionsCount).toBeGreaterThan(0);
    expect(state.moduleChartCount).toBeGreaterThan(0);
    expect(state.moduleWorkspaceTextLength).toBeGreaterThan(0);
    expect(state.moduleTableRows).toBeGreaterThan(0);
    expect(state.visibleSkeleton).toBe(0);
    expect(state.loadingFailure).toBe(false);
    expect(state.modalVisible).toBe(false);
  }

  await expectElementScreenshotMatchesBaseline(page, '#content', baselineScreenshotPath('laporan.png'));

  const captured = await errors.stop();
  expect(captured.pageErrors).toEqual([]);
  expect(captured.consoleErrors).toEqual([]);
  expect(captured.networkErrors).toEqual([]);
  expect(captured.failedResponses).toEqual([]);
});

test('laporan erp wisata handles hard api failure gracefully', async ({ page }) => {
  const errors = captureErrors(page);

  await page.route('**/api/erp-wisata/report**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'forced failure' }),
    });
  });

  await page.goto('/');
  await waitForRuntimeReady(page);

  await clickSidebarSectionItem(page, 'Laporan', 'ERP Wisata');
  await closeModalIfOpen(page);

  await expect(page.locator('#v-report')).toHaveClass(/on/);
  await expect(page.locator('#report-load')).toBeDisabled();
  await expect(page.locator('#report-load')).toHaveText('Memuat...');

  await expect(page.locator('#report-state')).toContainText('Error');
  await expect(page.locator('#report-state')).toContainText('HTTP 500');
  await expect(page.locator('#report-load')).toBeEnabled();
  await expect(page.locator('#report-load')).toHaveText('Muat Laporan');

  const state = await snapshotState(page);
  expect(state.visibleSkeleton).toBe(0);
  expect(state.modalVisible).toBe(false);

  const captured = await errors.stop();
  expect(captured.pageErrors).toEqual([]);
  const unexpectedConsoleErrors = captured.consoleErrors.filter((entry) => !entry.includes('status of 500'));
  expect(unexpectedConsoleErrors).toEqual([]);
  expect(captured.networkErrors).toEqual([]);
  expect(captured.failedResponses.some((entry) => entry.includes('/api/erp-wisata/report') && entry.includes('500'))).toBe(true);
});

test('laporan erp wisata shows permission message on 403', async ({ page }) => {
  const errors = captureErrors(page);

  await page.route('**/api/erp-wisata/report**', async (route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: "Forbidden: tidak punya izin 'wisata.laporan'" }),
    });
  });

  await page.goto('/');
  await waitForRuntimeReady(page);

  await clickSidebarSectionItem(page, 'Laporan', 'ERP Wisata');
  await closeModalIfOpen(page);

  await expect(page.locator('#v-report')).toHaveClass(/on/);
  await expect(page.locator('#report-state')).toContainText('Akses laporan ditolak');
  await expect(page.locator('#report-state')).toContainText('wisata.laporan');
  await expect(page.locator('#report-load')).toBeEnabled();
  await expect(page.locator('#report-load')).toHaveText('Muat Laporan');

  const state = await snapshotState(page);
  expect(state.visibleSkeleton).toBe(0);
  expect(state.modalVisible).toBe(false);

  const captured = await errors.stop();
  expect(captured.pageErrors).toEqual([]);
  const unexpectedConsoleErrors = captured.consoleErrors.filter((entry) => !entry.includes('status of 403'));
  expect(unexpectedConsoleErrors).toEqual([]);
  expect(captured.networkErrors).toEqual([]);
  expect(captured.failedResponses.some((entry) => entry.includes('/api/erp-wisata/report') && entry.includes('403'))).toBe(true);
});

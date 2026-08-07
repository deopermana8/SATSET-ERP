import { expect, test } from '@playwright/test';
import { baselineScreenshotPath, captureErrors, clickSidebarItem, closeModalIfOpen, expectElementScreenshotMatchesBaseline, snapshotState, waitForRuntimeReady } from '../utils/runtime.js';

test('ticketing module regression', async ({ page }) => {
  const errors = captureErrors(page);

  await page.goto('/');
  await waitForRuntimeReady(page);
  await clickSidebarItem(page, 'Ticketing');
  await closeModalIfOpen(page);

  const state = await snapshotState(page);
  expect(state.moduleTitle).toBe('ticketing');
  expect(state.moduleSubtitle).toBe('Kelola penjualan, scan, dan validasi tiket');
  expect(state.moduleShowcaseCount).toBeGreaterThan(0);
  expect(state.moduleQuickActionsCount).toBeGreaterThan(0);
  expect(state.moduleChartCount).toBeGreaterThan(0);
  expect(state.moduleWorkspaceTextLength).toBeGreaterThan(0);
  expect(state.moduleTableRows).toBeGreaterThan(0);
  expect(state.visibleSkeleton).toBe(0);
  expect(state.loadingFailure).toBe(false);
  expect(state.modalVisible).toBe(false);

  await expectElementScreenshotMatchesBaseline(page, '#content', baselineScreenshotPath('ticketing.png'));

  const captured = await errors.stop();
  expect(captured.pageErrors).toEqual([]);
  expect(captured.consoleErrors).toEqual([]);
  expect(captured.networkErrors).toEqual([]);
  expect(captured.failedResponses).toEqual([]);
});

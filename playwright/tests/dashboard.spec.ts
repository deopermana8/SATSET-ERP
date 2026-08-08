import { expect, test } from '@playwright/test';
import { baselineScreenshotPath, captureErrors, closeModalIfOpen, expectElementScreenshotMatchesBaseline, snapshotState, waitForRuntimeReady } from '../utils/runtime.js';

test('@smoke dashboard renders enterprise widgets', async ({ page }) => {
  const errors = captureErrors(page);

  await page.goto('/');
  await waitForRuntimeReady(page);
  await closeModalIfOpen(page);

  const state = await snapshotState(page);
  expect(state.dashboardTitle).toBe('Beranda');
  expect(state.dashboardSubtitle).toContain('Administrator');
  expect(state.dashboardSubtitle).toMatch(/^Selamat\s/i);
  expect(state.dashboardShowcaseCount).toBeGreaterThan(0);
  expect(state.dashboardQuickActionsCount).toBeGreaterThan(0);
  expect(state.dashboardChartCount).toBeGreaterThan(0);
  expect(state.dashboardWorkspaceCount).toBeGreaterThan(0);
  expect(state.dashboardTableRows).toBeGreaterThan(0);
  expect(state.visibleSkeleton).toBe(0);
  expect(state.loadingFailure).toBe(false);
  expect(state.modalVisible).toBe(false);

  await expectElementScreenshotMatchesBaseline(page, '#content', baselineScreenshotPath('dashboard.png'), ['#greet-sub', '#dash-last-update', '#dash-state'], 0.013);

  const captured = await errors.stop();
  expect(captured.pageErrors).toEqual([]);
  expect(captured.consoleErrors).toEqual([]);
  expect(captured.networkErrors).toEqual([]);
  expect(captured.failedResponses).toEqual([]);
});

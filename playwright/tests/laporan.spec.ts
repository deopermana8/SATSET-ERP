import { expect, test } from '@playwright/test';
import { baselineScreenshotPath, captureErrors, clickSidebarSectionItem, closeModalIfOpen, expectElementScreenshotMatchesBaseline, snapshotState, waitForRuntimeReady } from '../utils/runtime.js';

const reportItems = [
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

  for (const item of reportItems) {
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

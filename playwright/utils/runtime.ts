import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

type RuntimeErrorState = {
  pageErrors: string[];
  consoleErrors: string[];
  networkErrors: string[];
  failedResponses: string[];
  stop: () => Promise<RuntimeErrorSnapshot>;
};

type RuntimeErrorSnapshot = Omit<RuntimeErrorState, 'stop'>;

function normalizeText(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

export function captureErrors(page: Page): RuntimeErrorState {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  const failedResponses: string[] = [];

  const onPageError = (error: Error) => {
    pageErrors.push(error.message || String(error));
  };
  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  };
  const onRequestFailed = (request: { method: () => string; url: () => string; failure: () => { errorText?: string } | null }) => {
    networkErrors.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
  };
  const onResponse = async (response: { status: () => number; request: () => { method: () => string }; url: () => string }) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  return {
    pageErrors,
    consoleErrors,
    networkErrors,
    failedResponses,
    async stop() {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('requestfailed', onRequestFailed);
      page.off('response', onResponse);
      return { pageErrors, consoleErrors, networkErrors, failedResponses };
    },
  };
}

export async function visibleSkeletonCount(page: Page): Promise<number> {
  return page.evaluate(() => Array.from(document.querySelectorAll('.sk')).filter((node) => node instanceof HTMLElement && node.offsetParent !== null).length);
}

export async function workspaceHasContent(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((targetSelector) => {
    const node = document.querySelector(targetSelector);
    return Boolean(node && (node.textContent || '').trim().length > 0);
  }, selector);
}

export async function hasLoadingFailure(page: Page): Promise<boolean> {
  return page.evaluate(() => Array.from(document.querySelectorAll('body *')).some((node) => {
    if (!(node instanceof HTMLElement)) {
      return false;
    }
    if (node.offsetParent === null) {
      return false;
    }
    return (node.textContent || '').includes('Gagal memuat');
  }));
}

export async function closeModalIfOpen(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (typeof window.cMod === 'function') {
      window.cMod();
    }
  });
}

export async function waitForRuntimeReady(page: Page): Promise<void> {
  await page.waitForFunction(() => typeof window.gt === 'function');
}

export async function snapshotState(page: Page): Promise<{
  dashboardTitle: string;
  dashboardSubtitle: string;
  moduleTitle: string;
  moduleSubtitle: string;
  dashboardShowcaseCount: number;
  dashboardQuickActionsCount: number;
  dashboardChartCount: number;
  dashboardWorkspaceCount: number;
  dashboardTableRows: number;
  moduleShowcaseCount: number;
  moduleQuickActionsCount: number;
  moduleChartCount: number;
  moduleWorkspaceCount: number;
  moduleWorkspaceTextLength: number;
  moduleTableRows: number;
  visibleSkeleton: number;
  loadingFailure: boolean;
  modalVisible: boolean;
}> {
  return page.evaluate(() => {
    const normalizeText = (value: string | null | undefined): string => String(value ?? '').trim();
    const visibleSkeleton = Array.from(document.querySelectorAll('.sk')).filter((node) => node instanceof HTMLElement && node.offsetParent !== null).length;
    const modal = document.getElementById('dmod');
    const modalStyle = modal ? window.getComputedStyle(modal) : null;
    const modalVisible = Boolean(modalStyle && modalStyle.display !== 'none' && modalStyle.visibility !== 'hidden' && Number.parseFloat(modalStyle.opacity || '0') > 0.01);

    return {
      dashboardTitle: normalizeText(document.querySelector('.ph-title')?.textContent),
      dashboardSubtitle: normalizeText(document.getElementById('greet-sub')?.textContent),
      moduleTitle: normalizeText(document.getElementById('lt')?.textContent),
      moduleSubtitle: normalizeText(document.getElementById('ls')?.textContent),
      dashboardShowcaseCount: document.querySelectorAll('#dash-widget-grid > *').length,
      dashboardQuickActionsCount: document.querySelectorAll('#quick-actions .qa-btn').length,
      dashboardChartCount: document.querySelectorAll('#v-dash svg *').length,
      dashboardWorkspaceCount: document.querySelectorAll('#dash-widget-grid .widget-card, #dash-widget-grid .card, #dash-widget-grid .wid-list').length,
      dashboardTableRows: document.querySelectorAll('#rBody tr').length,
      moduleShowcaseCount: document.querySelectorAll('#module-showcase .sum-card').length,
      moduleQuickActionsCount: document.querySelectorAll('#module-inline-actions button').length,
      moduleChartCount: document.querySelectorAll('#module-mini-chart *').length,
      moduleWorkspaceCount: document.querySelectorAll('#module-workspace *').length,
      moduleWorkspaceTextLength: normalizeText(document.getElementById('module-workspace')?.textContent).length,
      moduleTableRows: document.querySelectorAll('#tbody tr').length,
      visibleSkeleton,
      loadingFailure: Array.from(document.querySelectorAll('body *')).some((node) => {
        if (!(node instanceof HTMLElement)) {
          return false;
        }
        if (node.offsetParent === null) {
          return false;
        }
        return (node.textContent || '').includes('Gagal memuat');
      }),
      modalVisible,
    };
  });
}

export async function clickSidebarItem(page: Page, label: string): Promise<void> {
  await page.evaluate(({ targetLabel }) => {
    const normalizeText = (value: string | null | undefined): string => String(value ?? '').trim();
    const items = Array.from(document.querySelectorAll('.sb-nav .sb-item')) as HTMLElement[];
    const target = items.find((item) => normalizeText(item.querySelector('.lbl')?.textContent) === normalizeText(targetLabel));
    if (!target) {
      throw new Error(`Sidebar item not found: ${targetLabel}`);
    }
    target.click();
  }, { targetLabel: label });
}

export async function clickSidebarSectionItem(page: Page, sectionLabel: string, itemLabel: string): Promise<void> {
  await page.evaluate(({ targetSection, targetLabel }) => {
    const normalizeText = (value: string | null | undefined): string => String(value ?? '').trim();
    const sections = Array.from(document.querySelectorAll('.sb-nav .sb-lbl')) as HTMLElement[];
    const section = sections.find((node) => normalizeText(node.textContent) === normalizeText(targetSection));
    if (!section) {
      throw new Error(`Sidebar section not found: ${targetSection}`);
    }

    let cursor = section.nextElementSibling;
    while (cursor) {
      if (cursor.classList.contains('sb-lbl')) {
        break;
      }
      if (cursor.classList.contains('sb-item')) {
        const labelNode = cursor.querySelector('.lbl');
        if (normalizeText(labelNode?.textContent) === normalizeText(targetLabel)) {
          (cursor as HTMLElement).click();
          return;
        }
      }
      cursor = cursor.nextElementSibling;
    }

    throw new Error(`Sidebar item not found in ${targetSection}: ${targetLabel}`);
  }, { targetSection: sectionLabel, targetLabel: itemLabel });
}

async function getMaskRects(page: Page, selectors: string[]): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
  const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    const box = await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }).catch(() => null as { x: number; y: number; width: number; height: number } | null);
    if (box) {
      rects.push(box);
    }
  }
  return rects;
}

function paintMask(buffer: Buffer, rects: Array<{ x: number; y: number; width: number; height: number }>): Buffer {
  if (!rects.length) {
    return buffer;
  }

  const image = PNG.sync.read(buffer);
  for (const rect of rects) {
    const left = Math.max(0, Math.floor(rect.x));
    const top = Math.max(0, Math.floor(rect.y));
    const right = Math.min(image.width, Math.ceil(rect.x + rect.width));
    const bottom = Math.min(image.height, Math.ceil(rect.y + rect.height));

    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const index = (image.width * y + x) << 2;
        image.data[index] = 255;
        image.data[index + 1] = 0;
        image.data[index + 2] = 255;
        image.data[index + 3] = 255;
      }
    }
  }

  return PNG.sync.write(image);
}

function cropImage(buffer: Buffer, rect: { x: number; y: number; width: number; height: number }): Buffer {
  const image = PNG.sync.read(buffer);
  const left = Math.max(0, Math.floor(rect.x));
  const top = Math.max(0, Math.floor(rect.y));
  const right = Math.min(image.width, Math.ceil(rect.x + rect.width));
  const bottom = Math.min(image.height, Math.ceil(rect.y + rect.height));
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const output = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = (image.width * (top + y) + (left + x)) << 2;
      const targetIndex = (output.width * y + x) << 2;
      output.data[targetIndex] = image.data[sourceIndex];
      output.data[targetIndex + 1] = image.data[sourceIndex + 1];
      output.data[targetIndex + 2] = image.data[sourceIndex + 2];
      output.data[targetIndex + 3] = image.data[sourceIndex + 3];
    }
  }

  return PNG.sync.write(output);
}

function compareImages(actualBuffer: Buffer, expectedBuffer: Buffer): number {
  const actual = PNG.sync.read(actualBuffer);
  const expected = PNG.sync.read(expectedBuffer);
  const width = Math.max(actual.width, expected.width);
  const height = Math.max(actual.height, expected.height);

  const normalize = (image: PNG): PNG => {
    if (image.width === width && image.height === height) {
      return image;
    }

    const output = new PNG({ width, height });
    for (let y = 0; y < height; y += 1) {
      const sourceY = Math.min(y, image.height - 1);
      for (let x = 0; x < width; x += 1) {
        const sourceX = Math.min(x, image.width - 1);
        const sourceIndex = (image.width * sourceY + sourceX) << 2;
        const targetIndex = (width * y + x) << 2;
        output.data[targetIndex] = image.data[sourceIndex];
        output.data[targetIndex + 1] = image.data[sourceIndex + 1];
        output.data[targetIndex + 2] = image.data[sourceIndex + 2];
        output.data[targetIndex + 3] = image.data[sourceIndex + 3];
      }
    }
    return output;
  };

  const normalizedActual = normalize(actual);
  const normalizedExpected = normalize(expected);

  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(normalizedActual.data, normalizedExpected.data, diff.data, width, height, {
    threshold: 0.12,
    includeAA: false,
  });

  return diffPixels / (width * height);
}

export async function expectScreenshotMatchesBaseline(page: Page, baselineFilePath: string, maskSelectors: string[] = [], maxDiffRatio = 0.01): Promise<void> {
  const actual = await page.screenshot({ fullPage: true });
  const expected = await fs.readFile(path.resolve(baselineFilePath));
  const maskRects = await getMaskRects(page, maskSelectors);
  const normalizedActual = paintMask(actual, maskRects);
  const normalizedExpected = paintMask(expected, maskRects);
  const diffRatio = compareImages(normalizedActual, normalizedExpected);
  expect(diffRatio).toBeLessThanOrEqual(maxDiffRatio);
}

export async function expectElementScreenshotMatchesBaseline(page: Page, selector: string, baselineFilePath: string, maskSelectors: string[] = [], maxDiffRatio = 0.01): Promise<void> {
  const locator = page.locator(selector).first();
  const box = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }).catch(() => null as { x: number; y: number; width: number; height: number } | null);
  if (!box) {
    throw new Error(`Screenshot target not visible: ${selector}`);
  }

  const actual = await locator.screenshot();
  const expected = await fs.readFile(path.resolve(baselineFilePath));
  const expectedCrop = cropImage(expected, box);
  const maskRects = await getMaskRects(page, maskSelectors);
  const cropMaskRects = maskRects
    .map((rect) => ({
      x: rect.x - box.x,
      y: rect.y - box.y,
      width: rect.width,
      height: rect.height,
    }))
    .filter((rect) => rect.x + rect.width > 0 && rect.y + rect.height > 0 && rect.x < box.width && rect.y < box.height);
  const normalizedActual = paintMask(actual, cropMaskRects);
  const normalizedExpected = paintMask(expectedCrop, cropMaskRects);
  const diffRatio = compareImages(normalizedActual, normalizedExpected);
  expect(diffRatio).toBeLessThanOrEqual(maxDiffRatio);
}

export function baselineScreenshotPath(fileName: string): string {
  return path.join(process.cwd(), 'playwright', 'baseline', 'sprint-27', fileName);
}

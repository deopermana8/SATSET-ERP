import type { MasterPageResult } from "./types.js";

export type PaginationWindow = {
  totalPages: number;
  currentPage: number;
  pages: number[];
  hasPrev: boolean;
  hasNext: boolean;
};

export function buildPaginationWindow(totalItems: number, page: number, pageSize: number, siblingCount = 1): PaginationWindow {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = Math.max(1, currentPage - siblingCount);
  const end = Math.min(totalPages, currentPage + siblingCount);
  const pages: number[] = [];

  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return {
    totalPages,
    currentPage,
    pages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

export function applyPage<TRecord extends Record<string, unknown>>(
  items: TRecord[],
  page: number,
  pageSize: number,
): MasterPageResult<TRecord> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    totalItems,
    page: currentPage,
    pageSize: safePageSize,
    totalPages,
  };
}

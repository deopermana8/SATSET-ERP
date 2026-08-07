import { applyFilterConditions } from "./filter.js";
import type { MasterPageResult, MasterTableColumnConfig, MasterTableQuery } from "./types.js";

export type VirtualWindow = {
  start: number;
  end: number;
  topOffset: number;
  bottomOffset: number;
};

export function sortRows<TRecord extends Record<string, unknown>>(
  rows: TRecord[],
  sortBy: string | undefined,
  direction: "asc" | "desc" = "asc",
): TRecord[] {
  if (!sortBy) {
    return rows;
  }

  const sorted = rows.slice();
  sorted.sort((left, right) => {
    const a = String(left[sortBy] ?? "").toLowerCase();
    const b = String(right[sortBy] ?? "").toLowerCase();
    const result = a.localeCompare(b, "id");
    return direction === "asc" ? result : -result;
  });
  return sorted;
}

export function paginateRows<TRecord extends Record<string, unknown>>(
  rows: TRecord[],
  page: number,
  pageSize: number,
): MasterPageResult<TRecord> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: rows.slice(start, end),
    totalItems,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export function queryRows<TRecord extends Record<string, unknown>>(
  rows: TRecord[],
  query: MasterTableQuery,
  searchableFields: string[],
): MasterPageResult<TRecord> {
  const keyword = (query.keyword ?? "").trim().toLowerCase();
  const searched = keyword.length === 0
    ? rows
    : rows.filter((row) => searchableFields.some((field) => String(row[field] ?? "").toLowerCase().includes(keyword)));

  const filtered = applyFilterConditions(searched, query.filterConditions);
  const sorted = sortRows(filtered, query.sortBy, query.sortDirection ?? "asc");
  return paginateRows(sorted, query.page, query.pageSize);
}

export function createVirtualWindow(totalRows: number, rowHeight: number, scrollTop: number, viewportHeight: number, overscan = 6): VirtualWindow {
  const safeHeight = Math.max(1, rowHeight);
  const visible = Math.max(1, Math.ceil(viewportHeight / safeHeight));
  const start = Math.max(0, Math.floor(scrollTop / safeHeight) - overscan);
  const end = Math.min(totalRows, start + visible + overscan * 2);
  return {
    start,
    end,
    topOffset: start * safeHeight,
    bottomOffset: Math.max(0, (totalRows - end) * safeHeight),
  };
}

export function reorderColumns<TRecord extends Record<string, unknown>>(
  columns: MasterTableColumnConfig<TRecord>[],
  orderKeys: string[],
): MasterTableColumnConfig<TRecord>[] {
  if (orderKeys.length === 0) {
    return columns;
  }
  const rank = new Map(orderKeys.map((key, index) => [key, index]));
  return columns.slice().sort((a, b) => {
    const ai = rank.get(String(a.key));
    const bi = rank.get(String(b.key));
    if (ai === undefined && bi === undefined) {
      return 0;
    }
    if (ai === undefined) {
      return 1;
    }
    if (bi === undefined) {
      return -1;
    }
    return ai - bi;
  });
}

export function setColumnVisibility<TRecord extends Record<string, unknown>>(
  columns: MasterTableColumnConfig<TRecord>[],
  visibilityMap: Record<string, boolean>,
): MasterTableColumnConfig<TRecord>[] {
  return columns.map((column) => ({
    ...column,
    visible: visibilityMap[String(column.key)] ?? column.visible ?? true,
  }));
}

export function setColumnSize<TRecord extends Record<string, unknown>>(
  columns: MasterTableColumnConfig<TRecord>[],
  key: string,
  width: number,
): MasterTableColumnConfig<TRecord>[] {
  const safeWidth = Math.max(64, Math.round(width));
  return columns.map((column) => (String(column.key) === key ? { ...column, width: safeWidth } : column));
}

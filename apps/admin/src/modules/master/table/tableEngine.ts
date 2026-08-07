import type { MasterFilterState, MasterRecord, MasterTableState } from "../crud/types.js";

export function filterMasterRows<T extends MasterRecord>(items: T[], state: MasterTableState, filters: MasterFilterState): T[] {
  const query = state.search.trim().toLowerCase();
  return items.filter((item) => {
    const matchesQuery = !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = !filters.status || String(item.status) === String(filters.status);
    return matchesQuery && matchesStatus;
  });
}

export function sortMasterRows<T extends MasterRecord>(items: T[], state: MasterTableState): T[] {
  if (!state.sortStack.length) {
    return items;
  }
  return [...items].sort((left, right) => {
    for (const entry of state.sortStack) {
      const a = String(left[entry.key] ?? "").toLowerCase();
      const b = String(right[entry.key] ?? "").toLowerCase();
      const result = a.localeCompare(b);
      if (result !== 0) {
        return entry.direction === "asc" ? result : -result;
      }
    }
    return 0;
  });
}

export function paginateMasterRows<T extends MasterRecord>(items: T[], state: MasterTableState): T[] {
  const start = Math.max(0, (state.page - 1) * state.pageSize);
  return items.slice(start, start + state.pageSize);
}

import type { MasterBulkActionRequest } from "./types.js";

export function toggleSelection(ids: string[], id: string, checked: boolean): string[] {
  const set = new Set(ids);
  if (checked) {
    set.add(id);
  } else {
    set.delete(id);
  }
  return Array.from(set);
}

export function toggleSelectAll(currentIds: string[], pageIds: string[], checked: boolean): string[] {
  const set = new Set(currentIds);
  for (const id of pageIds) {
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
  }
  return Array.from(set);
}

export function applyBulkDelete<TRecord extends { id: string }>(rows: TRecord[], selectedIds: string[]): TRecord[] {
  const selected = new Set(selectedIds);
  return rows.filter((row) => !selected.has(row.id));
}

export function buildBulkActionSummary(request: MasterBulkActionRequest): string {
  return `${request.action}:${request.selectedIds.length}`;
}

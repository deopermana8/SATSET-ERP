import type { CrudEntity } from "../types/crud.js";

export function searchEntities<T extends CrudEntity>(items: T[], query: string): T[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return items;
  }
  return items.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(term)));
}

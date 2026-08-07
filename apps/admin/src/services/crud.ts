import { apiFetch } from "./api.js";
import type { CrudEntity, CrudListResult } from "../types/crud.js";

export async function fetchCrudList<T extends CrudEntity>(apiUrl: string, entity: string): Promise<CrudListResult<T>> {
  const items = (await apiFetch<T[]>(apiUrl, `/erp-wisata/${entity}`)) ?? [];
  return {
    items,
    total: items.length,
  };
}

export async function createCrudItem<T extends CrudEntity>(apiUrl: string, entity: string, payload: Partial<T>): Promise<T | null> {
  return apiFetch<T>(apiUrl, `/erp-wisata/${entity}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateCrudItem<T extends CrudEntity>(apiUrl: string, entity: string, id: string, payload: Partial<T>): Promise<T | null> {
  return apiFetch<T>(apiUrl, `/erp-wisata/${entity}/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteCrudItem(apiUrl: string, entity: string, id: string): Promise<void> {
  await apiFetch(apiUrl, `/erp-wisata/${entity}/${id}`, {
    method: "DELETE",
  });
}

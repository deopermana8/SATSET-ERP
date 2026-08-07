import { apiFetch } from "../../../services/api.js";
import type { CrudRepository, MasterListResult, MasterRecord } from "./types.js";

export function createCrudRepository<T extends MasterRecord>(apiUrl: string, entity: string): CrudRepository<T> {
  return {
    async list(): Promise<MasterListResult<T>> {
      const items = (await apiFetch<T[]>(apiUrl, `/erp-wisata/${entity}`)) ?? [];
      return { items, total: items.length };
    },
    async findById(id: string): Promise<T | null> {
      return apiFetch<T>(apiUrl, `/erp-wisata/${entity}/${id}`);
    },
    async create(payload: Partial<T>): Promise<T> {
      const created = await apiFetch<T>(apiUrl, `/erp-wisata/${entity}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!created) {
        throw new Error(`Failed to create ${entity}`);
      }
      return created;
    },
    async update(id: string, payload: Partial<T>): Promise<T> {
      const updated = await apiFetch<T>(apiUrl, `/erp-wisata/${entity}/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!updated) {
        throw new Error(`Failed to update ${entity}`);
      }
      return updated;
    },
    async remove(id: string): Promise<void> {
      await apiFetch(apiUrl, `/erp-wisata/${entity}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

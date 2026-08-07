import type { RuntimeItem, RuntimeListResponse, RuntimeRepository, RuntimeRequest } from "./types.js";

export function createRuntimeRepository<TItem extends RuntimeItem>(entity: string, request: RuntimeRequest): RuntimeRepository<TItem> {
  const basePath = `/erp-wisata/${entity}`;

  return {
    async list() {
      const payload = await request<RuntimeListResponse<TItem>>(basePath, {
        method: "GET",
        cacheTtlMs: 25_000,
        retries: 2,
        retryDelayMs: 160,
      });
      return payload ?? { data: [], total: 0 };
    },
    async detail(id) {
      return await request<TItem>(`${basePath}/${id}`, {
        method: "GET",
        cacheTtlMs: 20_000,
        retries: 1,
      });
    },
    async create(payload) {
      return await request<TItem>(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        noCache: true,
        retries: 1,
      });
    },
    async update(id, payload) {
      return await request<TItem>(`${basePath}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        noCache: true,
        retries: 1,
      });
    },
    async remove(id) {
      await request<null>(`${basePath}/${id}`, {
        method: "DELETE",
        noCache: true,
        retries: 1,
      });
    },
  };
}

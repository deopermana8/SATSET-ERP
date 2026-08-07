import { ReservasiService } from "../domain/ReservasiService";

export function createReservasiRoute(service: ReservasiService) {
  return {
    create: async (payload: Record<string, unknown>) => service.create(payload),
    detail: async (id: string) => service.detail(id),
    list: async (query: { page: number; size: number }) => service.list(query),
    update: async (id: string, payload: Record<string, unknown>) => service.update(id, payload),
    remove: async (id: string) => service.remove(id)
  };
}

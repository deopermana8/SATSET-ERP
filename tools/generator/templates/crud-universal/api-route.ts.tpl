import { {{names.entity.pascal}}Service } from "../domain/{{names.entity.pascal}}Service";

export function create{{names.entity.pascal}}Route(service: {{names.entity.pascal}}Service) {
  return {
    create: async (payload: Record<string, unknown>) => service.create(payload),
    detail: async (id: string) => service.detail(id),
    list: async (query: { page: number; size: number }) => service.list(query),
    update: async (id: string, payload: Record<string, unknown>) => service.update(id, payload),
    remove: async (id: string) => service.remove(id)
  };
}

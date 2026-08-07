import type { RuntimeItem, RuntimeRepository, RuntimeService } from "./types.js";

export function createRuntimeService<TItem extends RuntimeItem>(repository: RuntimeRepository<TItem>): RuntimeService<TItem> {
  return {
    load: () => repository.list(),
    create: (payload) => repository.create(payload),
    update: (id, payload) => repository.update(id, payload),
    remove: (id) => repository.remove(id),
  };
}

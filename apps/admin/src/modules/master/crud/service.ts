import type { CrudRepository, CrudService, MasterListResult, MasterRecord } from "./types.js";

export function createCrudService<T extends MasterRecord>(repository: CrudRepository<T>): CrudService<T> {
  return {
    list(): Promise<MasterListResult<T>> {
      return repository.list();
    },
    create(payload: Partial<T>): Promise<T> {
      return repository.create(payload);
    },
    update(id: string, payload: Partial<T>): Promise<T> {
      return repository.update(id, payload);
    },
    remove(id: string): Promise<void> {
      return repository.remove(id);
    },
  };
}

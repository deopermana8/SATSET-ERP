import type { CrudController, CrudService, MasterListResult, MasterRecord } from "./types.js";

export function createCrudController<T extends MasterRecord>(service: CrudService<T>): CrudController<T> {
  return {
    load(): Promise<MasterListResult<T>> {
      return service.list();
    },
    async save(payload: Partial<T>, id?: string): Promise<T> {
      if (id) {
        return service.update(id, payload);
      }
      return service.create(payload);
    },
    remove(id: string): Promise<void> {
      return service.remove(id);
    },
  };
}

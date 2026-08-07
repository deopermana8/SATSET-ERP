import { createCrudRepository } from "../crud/repository.js";
import type { MasterEntityKey, MasterRecord } from "../crud/types.js";

export function createMasterRepository<T extends MasterRecord>(apiUrl: string, entity: MasterEntityKey) {
  return createCrudRepository<T>(apiUrl, entity);
}

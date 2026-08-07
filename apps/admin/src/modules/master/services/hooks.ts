import type { MasterEntityKey } from "../crud/types.js";

export function createMasterCacheKey(entity: MasterEntityKey, suffix: string): string {
  return `satset-master-${entity}-${suffix}`;
}

export function createMasterDraftKey(entity: MasterEntityKey, id: string | null): string {
  return createMasterCacheKey(entity, id ?? "new");
}

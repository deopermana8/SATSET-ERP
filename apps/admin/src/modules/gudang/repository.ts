import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type GudangItem = RuntimeItem;

export function createGudangRepository(request: RuntimeRequest): RuntimeRepository<GudangItem> {
  return createRuntimeRepository<GudangItem>("gudang", request);
}

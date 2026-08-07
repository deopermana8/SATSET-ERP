import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type KeuanganItem = RuntimeItem;

export function createKeuanganRepository(request: RuntimeRequest): RuntimeRepository<KeuanganItem> {
  return createRuntimeRepository<KeuanganItem>("keuangan", request);
}

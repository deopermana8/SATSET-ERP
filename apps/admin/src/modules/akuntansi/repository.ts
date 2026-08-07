import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type AkuntansiItem = RuntimeItem;

export function createAkuntansiRepository(request: RuntimeRequest): RuntimeRepository<AkuntansiItem> {
  return createRuntimeRepository<AkuntansiItem>("akuntansi", request);
}

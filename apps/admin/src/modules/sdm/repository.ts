import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type SdmItem = RuntimeItem;

export function createSdmRepository(request: RuntimeRequest): RuntimeRepository<SdmItem> {
  return createRuntimeRepository<SdmItem>("sdm", request);
}

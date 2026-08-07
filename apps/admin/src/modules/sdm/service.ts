import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createSdmRepository } from "./repository.js";

export function createSdmService(request: RuntimeRequest) {
  const repository = createSdmRepository(request);
  return createRuntimeService(repository);
}

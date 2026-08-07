import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createGudangRepository } from "./repository.js";

export function createGudangService(request: RuntimeRequest) {
  const repository = createGudangRepository(request);
  return createRuntimeService(repository);
}

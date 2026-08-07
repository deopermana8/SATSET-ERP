import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createKeuanganRepository } from "./repository.js";

export function createKeuanganService(request: RuntimeRequest) {
  const repository = createKeuanganRepository(request);
  return createRuntimeService(repository);
}

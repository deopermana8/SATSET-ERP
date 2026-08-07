import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createAkuntansiRepository } from "./repository.js";

export function createAkuntansiService(request: RuntimeRequest) {
  const repository = createAkuntansiRepository(request);
  return createRuntimeService(repository);
}

import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createDashboardRepository } from "./repository.js";

export function createDashboardService(request: RuntimeRequest) {
  const repository = createDashboardRepository(request);
  return createRuntimeService(repository);
}

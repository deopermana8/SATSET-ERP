import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type DashboardItem = RuntimeItem;

export function createDashboardRepository(request: RuntimeRequest): RuntimeRepository<DashboardItem> {
  return createRuntimeRepository<DashboardItem>("destinasi", request);
}

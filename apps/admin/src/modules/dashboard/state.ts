import { createRuntimeState } from "../runtime-core/index.js";
import type { DashboardItem } from "./repository.js";

export const dashboardState = createRuntimeState<DashboardItem>();

import { createRuntimeState } from "../runtime-core/index.js";
import type { CafeOrderRecord } from "./cafeTypes.js";

export const cafeState = createRuntimeState<CafeOrderRecord>();

import { createRuntimeState } from "../runtime-core/index.js";
import type { GudangItem } from "./repository.js";

export const gudangState = createRuntimeState<GudangItem>();

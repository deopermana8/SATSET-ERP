import { createRuntimeState } from "../runtime-core/index.js";
import type { AkuntansiItem } from "./repository.js";

export const akuntansiState = createRuntimeState<AkuntansiItem>();

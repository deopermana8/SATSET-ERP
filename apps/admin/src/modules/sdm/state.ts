import { createRuntimeState } from "../runtime-core/index.js";
import type { SdmItem } from "./repository.js";

export const sdmState = createRuntimeState<SdmItem>();

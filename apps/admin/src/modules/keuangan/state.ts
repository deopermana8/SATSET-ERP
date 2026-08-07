import { createRuntimeState } from "../runtime-core/index.js";
import type { KeuanganItem } from "./repository.js";

export const keuanganState = createRuntimeState<KeuanganItem>();

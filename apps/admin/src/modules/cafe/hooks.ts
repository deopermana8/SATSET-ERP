import { createRuntimeDebounce, createRuntimeMemo } from "../runtime-core/index.js";

export const useCafeMemo = createRuntimeMemo;
export const useCafeDebounce = createRuntimeDebounce;

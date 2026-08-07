import { createRuntimeDebounce, createRuntimeMemo } from "../runtime-core/index.js";

export const useSdmMemo = createRuntimeMemo;
export const useSdmDebounce = createRuntimeDebounce;

import { createRuntimeDebounce, createRuntimeMemo } from "../runtime-core/index.js";

export const useGudangMemo = createRuntimeMemo;
export const useGudangDebounce = createRuntimeDebounce;

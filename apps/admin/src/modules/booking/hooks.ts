import { createRuntimeDebounce, createRuntimeMemo } from "../runtime-core/index.js";

export const useBookingMemo = createRuntimeMemo;
export const useBookingDebounce = createRuntimeDebounce;

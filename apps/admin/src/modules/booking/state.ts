import { createRuntimeState } from "../runtime-core/index.js";
import type { BookingRecord } from "./bookingTypes.js";

export const bookingState = createRuntimeState<BookingRecord>();

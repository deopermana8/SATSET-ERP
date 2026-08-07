import { createRuntimeState } from "../runtime-core/index.js";
import type { TicketingItem } from "./repository.js";

export const ticketingState = createRuntimeState<TicketingItem>();

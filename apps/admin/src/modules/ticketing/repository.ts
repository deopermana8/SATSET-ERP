import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeItem, RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";

export type TicketingItem = RuntimeItem;

export function createTicketingRepository(request: RuntimeRequest): RuntimeRepository<TicketingItem> {
  return createRuntimeRepository<TicketingItem>("ticketing", request);
}

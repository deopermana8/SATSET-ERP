import { createRuntimeService } from "../runtime-core/index.js";
import type { RuntimeRequest } from "../runtime-core/index.js";
import { createTicketingRepository } from "./repository.js";

export function createTicketingService(request: RuntimeRequest) {
  const repository = createTicketingRepository(request);
  return createRuntimeService(repository);
}

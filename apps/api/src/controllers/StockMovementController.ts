import { StockMovementService } from "../services/StockMovementService.js";

export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  async list() {
    return this.stockMovementService.list();
  }

  async listByQuery(query: Record<string, string | undefined>) {
    return this.stockMovementService.listByQuery(query);
  }
}

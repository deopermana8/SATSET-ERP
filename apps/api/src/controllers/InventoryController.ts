import type { CreateInventoryDto, UpdateInventoryDto } from "../dto/InventoryDto.js";
import type { CreateStockAdjustmentDto } from "../dto/StockAdjustmentDto.js";
import { InventoryService } from "../services/InventoryService.js";
import { InventoryReportService } from "../services/InventoryReportService.js";

export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryReportService: InventoryReportService
  ) {}

  async list() {
    return this.inventoryService.list();
  }

  async get(id: string) {
    return this.inventoryService.get(id);
  }

  async create(payload: CreateInventoryDto) {
    return this.inventoryService.create(payload);
  }

  async update(id: string, payload: UpdateInventoryDto) {
    return this.inventoryService.update(id, payload);
  }

  async adjustStock(payload: CreateStockAdjustmentDto) {
    return this.inventoryService.adjustStock(payload);
  }

  async report() {
    return this.inventoryReportService.inventoryReport();
  }

  async dashboard() {
    return this.inventoryReportService.dashboard();
  }
}

import type { CreateInventoryDto, InventoryDto, UpdateInventoryDto } from "../dto/InventoryDto.js";
import type { CreateStockAdjustmentDto } from "../dto/StockAdjustmentDto.js";
import { InventoryRepository } from "../repositories/InventoryRepository.js";
import { StockMovementService } from "./StockMovementService.js";

export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly stockMovementService: StockMovementService
  ) {}

  async list(): Promise<InventoryDto[]> {
    return this.inventoryRepository.findAll();
  }

  async get(id: string): Promise<InventoryDto> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new Error("Inventory not found");
    }
    return inventory;
  }

  async create(data: CreateInventoryDto): Promise<InventoryDto> {
    if (!data.code.trim()) {
      throw new Error("Inventory code is required");
    }
    if (!data.name.trim()) {
      throw new Error("Inventory name is required");
    }

    const existing = await this.inventoryRepository.findByCode(data.code.trim());
    if (existing) {
      throw new Error("Inventory code already exists");
    }

    if (data.minimumStock < 0 || data.currentStock < 0 || data.averageCost < 0) {
      throw new Error("Inventory numeric values must be >= 0");
    }

    return this.inventoryRepository.create({
      ...data,
      code: data.code.trim(),
      name: data.name.trim(),
      unit: data.unit.trim(),
      category: data.category.trim()
    });
  }

  async update(id: string, data: UpdateInventoryDto): Promise<InventoryDto> {
    if (typeof data.minimumStock === "number" && data.minimumStock < 0) {
      throw new Error("minimumStock must be >= 0");
    }
    if (typeof data.currentStock === "number" && data.currentStock < 0) {
      throw new Error("currentStock must be >= 0");
    }
    if (typeof data.averageCost === "number" && data.averageCost < 0) {
      throw new Error("averageCost must be >= 0");
    }

    if (data.code?.trim()) {
      const existing = await this.inventoryRepository.findByCode(data.code.trim());
      if (existing && existing.id !== id) {
        throw new Error("Inventory code already exists");
      }
    }

    const updated = await this.inventoryRepository.update(id, {
      ...data,
      code: data.code?.trim(),
      name: data.name?.trim(),
      unit: data.unit?.trim(),
      category: data.category?.trim()
    });
    if (!updated) {
      throw new Error("Inventory not found");
    }
    return updated;
  }

  async changeStock(
    inventoryId: string,
    qtyDelta: number,
    reference: string,
    movementType: "IN" | "OUT" | "ADJUSTMENT"
  ): Promise<InventoryDto> {
    const inventory = await this.inventoryRepository.findById(inventoryId);
    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const nextStock = inventory.currentStock + qtyDelta;
    if (nextStock < 0) {
      throw new Error(`Insufficient inventory stock for ${inventory.name}`);
    }

    const updated = await this.inventoryRepository.update(inventory.id, {
      currentStock: nextStock
    });
    if (!updated) {
      throw new Error("Inventory not found");
    }

    await this.stockMovementService.create({
      inventoryId,
      movementType,
      qty: qtyDelta,
      balance: nextStock,
      reference
    });

    return updated;
  }

  async adjustStock(data: CreateStockAdjustmentDto): Promise<InventoryDto> {
    if (!data.reason.trim()) {
      throw new Error("Stock adjustment reason is required");
    }

    return this.changeStock(data.inventoryId, data.qty, `ADJUSTMENT:${data.reason.trim()}`, "ADJUSTMENT");
  }

  async getLowStock(): Promise<InventoryDto[]> {
    const list = await this.inventoryRepository.findAll();
    return list.filter((item) => item.currentStock <= item.minimumStock && item.active);
  }

  async getInventoryValue(): Promise<number> {
    const list = await this.inventoryRepository.findAll();
    return list.reduce((sum, item) => sum + item.currentStock * item.averageCost, 0);
  }
}

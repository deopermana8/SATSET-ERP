import { InventoryService } from "./InventoryService.js";
import { PurchaseOrderRepository } from "../repositories/PurchaseOrderRepository.js";
import { StockMovementRepository } from "../repositories/StockMovementRepository.js";

export class InventoryReportService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly stockMovementRepository: StockMovementRepository
  ) {}

  private isSameDay(dateIso: string, dayIso: string): boolean {
    return dateIso.slice(0, 10) === dayIso.slice(0, 10);
  }

  async dashboard() {
    const lowStock = await this.inventoryService.getLowStock();
    const inventoryValue = await this.inventoryService.getInventoryValue();

    const now = new Date().toISOString();
    const purchaseOrders = await this.purchaseOrderRepository.findAll();
    const purchaseToday = purchaseOrders
      .filter((po) => po.status === "RECEIVED" && this.isSameDay(po.updatedAt, now))
      .reduce((sum, po) => sum + po.total, 0);

    const movements = await this.stockMovementRepository.findAll();
    const consumptionToday = movements
      .filter((movement) => movement.movementType === "OUT" && this.isSameDay(movement.createdAt, now))
      .reduce((sum, movement) => sum + Math.abs(movement.qty), 0);

    const wasteToday = movements
      .filter(
        (movement) =>
          movement.movementType === "ADJUSTMENT" &&
          movement.qty < 0 &&
          this.isSameDay(movement.createdAt, now)
      )
      .reduce((sum, movement) => sum + Math.abs(movement.qty), 0);

    return {
      lowStock,
      inventoryValue,
      purchaseToday,
      consumptionToday,
      wasteToday
    };
  }

  async inventoryReport() {
    const items = await this.inventoryService.list();
    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      averageCost: item.averageCost,
      inventoryValue: item.currentStock * item.averageCost,
      status: item.currentStock <= item.minimumStock ? "LOW" : "OK"
    }));
  }
}

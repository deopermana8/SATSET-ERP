import { InventoryItem } from "../../domain/entities/inventory-item";
import { InventoryTransaction } from "../../domain/entities/inventory-transaction";
import { WorkflowDashboardStore } from "@satset/shared";

export type InventoryServiceResult<T> = {
  item: T;
  events: Array<{ type: string; quantity: number }>;
};

export class InventoryService {
  constructor(private readonly dashboard: WorkflowDashboardStore) {}

  public reduceStock(item: InventoryItem, quantity: number): InventoryServiceResult<InventoryTransaction> {
    item.removeStock(quantity);
    const transaction = InventoryTransaction.create({
      id: `txn-${Date.now()}`,
      transactionType: "stock-out",
      itemSku: item.sku,
      itemName: item.name,
      quantity,
      reference: `SALE-${Date.now()}`,
      notes: "Automated reduction after sale",
      createdBy: "Workflow",
    });

    this.dashboard.increment("inventoryAdjustments");

    return { item: transaction, events: [{ type: "InventoryReduced", quantity }] };
  }

  public restock(item: InventoryItem, quantity: number): InventoryServiceResult<InventoryTransaction> {
    item.addStock(quantity);
    const transaction = InventoryTransaction.create({
      id: `txn-${Date.now()}`,
      transactionType: "stock-in",
      itemSku: item.sku,
      itemName: item.name,
      quantity,
      reference: `RESTOCK-${Date.now()}`,
      notes: "Automated restock",
      createdBy: "Workflow",
    });

    this.dashboard.increment("inventoryAdjustments");

    return { item: transaction, events: [{ type: "InventoryRestocked", quantity }] };
  }
}

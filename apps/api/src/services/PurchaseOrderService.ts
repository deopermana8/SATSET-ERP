import type { CancelPurchaseOrderDto, CreatePurchaseOrderDto, PurchaseOrderItemDto } from "../dto/PurchaseOrderDto.js";
import { InventoryRepository } from "../repositories/InventoryRepository.js";
import { PurchaseOrderRepository } from "../repositories/PurchaseOrderRepository.js";
import { SupplierRepository } from "../repositories/SupplierRepository.js";
import { PurchaseOrderValidator } from "../validators/PurchaseOrderValidator.js";
import { InventoryService } from "./InventoryService.js";

export class PurchaseOrderService {
  private poCounter = 1;
  private readonly validator = new PurchaseOrderValidator();

  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryService: InventoryService
  ) {}

  async list() {
    return this.purchaseOrderRepository.findAll();
  }

  async get(id: string) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }
    return purchaseOrder;
  }

  async create(data: CreatePurchaseOrderDto) {
    this.validator.validateCreate(data);

    const supplier = await this.supplierRepository.findById(data.supplierId);
    if (!supplier || !supplier.active) {
      throw new Error("Supplier not found or inactive");
    }

    const items: PurchaseOrderItemDto[] = [];
    for (const item of data.items) {
      const inventory = await this.inventoryRepository.findById(item.inventoryId);
      if (!inventory || !inventory.active) {
        throw new Error(`Inventory not found or inactive: ${item.inventoryId}`);
      }
      if (item.qty <= 0 || item.unitCost < 0) {
        throw new Error("Purchase order item qty must be > 0 and cost must be >= 0");
      }

      items.push({
        inventoryId: inventory.id,
        inventoryName: inventory.name,
        qty: item.qty,
        unitCost: item.unitCost,
        total: item.qty * item.unitCost
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const poNumber = `PO-${String(this.poCounter).padStart(5, "0")}`;
    this.poCounter += 1;

    return this.purchaseOrderRepository.create({
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: "DRAFT",
      items,
      subtotal,
      total: subtotal
    });
  }

  async approve(id: string) {
    const po = await this.purchaseOrderRepository.findById(id);
    if (!po) {
      throw new Error("Purchase order not found");
    }
    if (po.status !== "DRAFT") {
      throw new Error("Only DRAFT purchase order can be approved");
    }

    const updated = await this.purchaseOrderRepository.update(id, {
      status: "APPROVED"
    });
    if (!updated) {
      throw new Error("Purchase order not found");
    }
    return updated;
  }

  async receive(id: string) {
    const po = await this.purchaseOrderRepository.findById(id);
    if (!po) {
      throw new Error("Purchase order not found");
    }
    if (po.status !== "APPROVED") {
      throw new Error("Only APPROVED purchase order can be received");
    }

    for (const item of po.items) {
      await this.inventoryService.changeStock(item.inventoryId, item.qty, `PO_RECEIVE:${po.poNumber}`, "IN");

      const inventory = await this.inventoryRepository.findById(item.inventoryId);
      if (inventory) {
        const currentValue = inventory.averageCost * Math.max(0, inventory.currentStock - item.qty);
        const incomingValue = item.unitCost * item.qty;
        const nextQty = inventory.currentStock;
        const averageCost = nextQty <= 0 ? inventory.averageCost : (currentValue + incomingValue) / nextQty;
        await this.inventoryRepository.update(inventory.id, { averageCost });
      }
    }

    const updated = await this.purchaseOrderRepository.update(id, {
      status: "RECEIVED"
    });
    if (!updated) {
      throw new Error("Purchase order not found");
    }
    return updated;
  }

  async cancel(id: string, payload: CancelPurchaseOrderDto = {}) {
    this.validator.validateCancel(payload);

    const po = await this.purchaseOrderRepository.findById(id);
    if (!po) {
      throw new Error("Purchase order not found");
    }
    if (po.status === "RECEIVED") {
      throw new Error("Only DRAFT or APPROVED purchase order can be cancelled");
    }
    if (po.status === "CANCELLED") {
      throw new Error("Purchase order already cancelled");
    }

    const updated = await this.purchaseOrderRepository.update(id, {
      status: "CANCELLED"
    });
    if (!updated) {
      throw new Error("Purchase order not found");
    }
    return updated;
  }
}

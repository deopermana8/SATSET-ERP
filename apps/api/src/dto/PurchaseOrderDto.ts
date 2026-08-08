export type PurchaseOrderStatus = "DRAFT" | "APPROVED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderItemDto {
  inventoryId: string;
  inventoryName: string;
  qty: number;
  unitCost: number;
  total: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItemDto[];
}

export interface CancelPurchaseOrderDto {
  reason?: string;
}

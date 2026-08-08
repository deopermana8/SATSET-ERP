export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovementDto {
  id: string;
  inventoryId: string;
  movementType: StockMovementType;
  qty: number;
  balance: number;
  reference: string;
  createdAt: string;
}

import type { StockMovementType } from "./StockMovementDto.js";

export interface StockMovementQueryDto {
  inventoryId?: string;
  movementType?: StockMovementType;
  reference?: string;
  from?: string;
  to?: string;
}
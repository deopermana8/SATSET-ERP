export interface InventoryDto {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  minimumStock: number;
  currentStock: number;
  averageCost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryDto {
  code: string;
  name: string;
  unit: string;
  category: string;
  minimumStock: number;
  currentStock: number;
  averageCost: number;
  active: boolean;
}

export interface UpdateInventoryDto {
  code?: string;
  name?: string;
  unit?: string;
  category?: string;
  minimumStock?: number;
  currentStock?: number;
  averageCost?: number;
  active?: boolean;
}

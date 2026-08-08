export interface MenuItemDto {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface CreateMenuItemDto {
  categoryId: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface UpdateMenuItemDto {
  categoryId?: string;
  code?: string;
  name?: string;
  price?: number;
  stock?: number;
  active?: boolean;
}

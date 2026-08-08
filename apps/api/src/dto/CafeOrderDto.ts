export type CafeOrderType = "DINE_IN" | "TAKE_AWAY";
export type CafePaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export interface CafeOrderItemDto {
  menuItemId: string;
  menuName: string;
  qty: number;
  price: number;
  total: number;
}

export interface CreateCafeOrderDto {
  customerName: string;
  tableNumber: string;
  orderType: CafeOrderType;
  paymentMethod: CafePaymentMethod;
  discount: number;
  tax: number;
  items: CafeOrderItemDto[];
}

export interface PayCafeOrderDto {
  paymentMethod: CafePaymentMethod;
}

export interface CreateTicketSaleDto {
  saleNumber?: string;
  ticketNumber?: string;
  qrToken?: string;
  shiftId?: string;
  cashierId?: string;
  cashierName?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paidAmount?: number;
  changeAmount?: number;
  status?: string;
  soldAt?: string;
  printedAt?: string;
  checkedInAt?: string;
  voidedAt?: string;
  paidAt?: string;
  items: TicketSaleItemDto[];
}

export interface UpdateTicketSaleDto {
  saleNumber?: string;
  ticketNumber?: string;
  qrToken?: string;
  shiftId?: string;
  cashierId?: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paidAmount?: number;
  changeAmount?: number;
  status?: string;
  soldAt?: string;
  printedAt?: string | null;
  checkedInAt?: string | null;
  voidedAt?: string | null;
  paidAt?: string | null;
  items?: TicketSaleItemDto[];
}

export interface TicketSaleItemDto {
  ticketId: string;
  ticketName: string;
  qty: number;
  price: number;
  total: number;
}

export interface MarkTicketSalePaidDto {
  paymentMethod: string;
  paidAmount: number;
}

export interface CheckInTicketSaleDto {
  qrToken: string;
}

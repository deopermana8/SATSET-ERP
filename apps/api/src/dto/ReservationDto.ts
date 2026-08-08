export type ReservationPaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export interface ReservationItemDto {
  ticketId: string;
  ticketName: string;
  qty: number;
  price: number;
  total: number;
}

export interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  visitDate: string;
  visitSession: string;
  paymentMethod: ReservationPaymentMethod;
  ticketItems: ReservationItemDto[];
}

export interface PayReservationDto {
  paymentMethod: ReservationPaymentMethod;
}

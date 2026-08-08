export type ActivityBookingStatus = "WAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";

export interface CreateActivityBookingDto {
  reservationId: string;
  customerName: string;
  activityId: string;
  scheduleId: string;
  qty: number;
}

export interface PayActivityBookingDto {
  paymentMethod: "CASH" | "QRIS" | "TRANSFER";
}

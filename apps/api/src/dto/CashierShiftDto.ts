export interface OpenCashierShiftDto {
  cashierId: string;
  cashierName: string;
  openingCash: number;
}

export interface CloseCashierShiftDto {
  closingCash: number;
}

export interface UpdateCashierShiftDto {
  closedAt?: string | null;
  closingCash?: number;
  cashSales?: number;
  qrisSales?: number;
  transferSales?: number;
  ticketCount?: number;
  status?: "OPEN" | "CLOSED";
  difference?: number;
}

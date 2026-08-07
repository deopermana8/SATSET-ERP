export type TicketTariffType = "Dewasa" | "Anak" | "Rombongan" | "VIP" | "Event" | "Musiman";

export type TicketStatus =
  | "Belum Digunakan"
  | "Sudah Digunakan"
  | "Kadaluarsa"
  | "Void"
  | "Refund";

export type TicketPaymentMethod = "Tunai" | "Kartu" | "Transfer" | "QRIS" | "EWallet";

export type TicketSaleChannel = "Offline" | "Online";

export type TicketTariff = {
  type: TicketTariffType;
  price: number;
  taxPercent: number;
  seasonalFactor: number;
};

export type TicketRecord = {
  id: string;
  name: string;
  status: TicketStatus;
  ticketNo: string;
  bookingNo?: string;
  qrCode: string;
  barcode: string;
  tariffType: TicketTariffType;
  channel: TicketSaleChannel;
  paymentMethod: TicketPaymentMethod;
  amount: number;
  discount: number;
  tax: number;
  total: number;
  issuedAt: string;
  expiredAt: string;
};

export type TicketScanHistoryItem = {
  ticketNo: string;
  scannedAt: string;
  gate: string;
  result: "valid" | "used" | "invalid";
};

export type TicketDashboardSummary = {
  tiketHariIni: number;
  pendapatanTiket: number;
  tiketDigunakan: number;
  tiketBelumDigunakan: number;
};

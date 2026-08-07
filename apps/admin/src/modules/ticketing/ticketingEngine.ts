import type {
  TicketDashboardSummary,
  TicketPaymentMethod,
  TicketRecord,
  TicketSaleChannel,
  TicketStatus,
  TicketTariff,
  TicketTariffType,
} from "./ticketingTypes.js";

export const ticketTariffs: TicketTariff[] = [
  { type: "Dewasa", price: 50000, taxPercent: 11, seasonalFactor: 1 },
  { type: "Anak", price: 30000, taxPercent: 11, seasonalFactor: 1 },
  { type: "Rombongan", price: 40000, taxPercent: 11, seasonalFactor: 0.9 },
  { type: "VIP", price: 120000, taxPercent: 11, seasonalFactor: 1 },
  { type: "Event", price: 150000, taxPercent: 11, seasonalFactor: 1.2 },
  { type: "Musiman", price: 60000, taxPercent: 11, seasonalFactor: 1.15 },
];

export const ticketStatuses: TicketStatus[] = [
  "Belum Digunakan",
  "Sudah Digunakan",
  "Kadaluarsa",
  "Void",
  "Refund",
];

export const ticketPaymentMethods: TicketPaymentMethod[] = [
  "Tunai",
  "Kartu",
  "Transfer",
  "QRIS",
  "EWallet",
];

export const ticketSaleChannels: TicketSaleChannel[] = ["Offline", "Online"];

export function findTariff(type: TicketTariffType): TicketTariff {
  return ticketTariffs.find((tariff) => tariff.type === type) ?? ticketTariffs[0];
}

export function generateTicketNo(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const s = String(now.getTime()).slice(-6);
  return `TKT-${y}${m}${d}-${s}`;
}

export function buildQrCode(ticketNo: string): string {
  return `SATSET:QR:${ticketNo}`;
}

export function buildBarcode(ticketNo: string): string {
  return `SATSET:BAR:${ticketNo}`;
}

export function calculateTicketAmount(tariffType: TicketTariffType, qty: number, discountPercent: number): {
  amount: number;
  discount: number;
  tax: number;
  total: number;
} {
  const tariff = findTariff(tariffType);
  const amount = Math.max(1, qty) * tariff.price * tariff.seasonalFactor;
  const discount = amount * Math.max(0, Math.min(discountPercent, 100)) / 100;
  const net = amount - discount;
  const tax = net * tariff.taxPercent / 100;
  const total = net + tax;
  return { amount, discount, tax, total };
}

export function summarizeTicketDashboard(rows: TicketRecord[]): TicketDashboardSummary {
  const today = new Date().toISOString().slice(0, 10);
  return rows.reduce<TicketDashboardSummary>((acc, row) => {
    if ((row.issuedAt || "").slice(0, 10) === today) acc.tiketHariIni += 1;
    if (row.status === "Sudah Digunakan") acc.tiketDigunakan += 1;
    if (row.status === "Belum Digunakan") acc.tiketBelumDigunakan += 1;
    acc.pendapatanTiket += Number(row.total || 0);
    return acc;
  }, {
    tiketHariIni: 0,
    pendapatanTiket: 0,
    tiketDigunakan: 0,
    tiketBelumDigunakan: 0,
  });
}

export function toTicketRecord(input: Partial<TicketRecord>): TicketRecord {
  const ticketNo = input.ticketNo || generateTicketNo();
  return {
    id: input.id || ticketNo,
    name: input.name || `Tiket ${ticketNo}`,
    status: input.status || "Belum Digunakan",
    ticketNo,
    qrCode: input.qrCode || buildQrCode(ticketNo),
    barcode: input.barcode || buildBarcode(ticketNo),
    tariffType: input.tariffType || "Dewasa",
    channel: input.channel || "Offline",
    paymentMethod: input.paymentMethod || "Tunai",
    amount: Number(input.amount || 0),
    discount: Number(input.discount || 0),
    tax: Number(input.tax || 0),
    total: Number(input.total || 0),
    issuedAt: input.issuedAt || new Date().toISOString(),
    expiredAt: input.expiredAt || new Date(Date.now() + 86400000).toISOString(),
  };
}

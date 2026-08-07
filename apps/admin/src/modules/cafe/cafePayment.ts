import type { CafeFinancialAdapterConfig, CafeFinancialJournal, CafeOrderRecord } from "./cafeTypes.js";

export const defaultCafeFinancialConfig: CafeFinancialAdapterConfig = {
  debitKas: "Kas",
  debitQris: "QRIS",
  debitPiutang: "Piutang",
  kreditPendapatan: "Pendapatan Cafe",
  kreditPajak: "Pajak Keluaran",
  kreditServiceCharge: "Service Charge",
};

export function resolveCafeDebitAccount(order: CafeOrderRecord, config: CafeFinancialAdapterConfig): string {
  if (order.pembayaran.metode === "Tunai") return config.debitKas;
  if (order.pembayaran.metode === "QRIS") return config.debitQris;
  return config.debitPiutang;
}

export function buildCafeFinancialJournal(order: CafeOrderRecord, config: CafeFinancialAdapterConfig = defaultCafeFinancialConfig): CafeFinancialJournal {
  const lines: CafeFinancialJournal["lines"] = [
    { akun: resolveCafeDebitAccount(order, config), posisi: "Debit", nominal: order.total },
    { akun: config.kreditPendapatan, posisi: "Kredit", nominal: Math.max(0, order.subtotal - order.diskon) },
    { akun: config.kreditPajak, posisi: "Kredit", nominal: order.pajak },
    { akun: config.kreditServiceCharge, posisi: "Kredit", nominal: order.serviceCharge },
  ];

  return {
    referensi: order.orderNo,
    keterangan: `Jurnal operasional cafe ${order.orderNo}`,
    lines: lines.filter((line) => line.nominal > 0),
  };
}

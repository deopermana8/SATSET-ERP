import { resolveCashAccountIdBySource } from "./financeCash.js";
import { buildFinanceJournalAdapter } from "./financeJournalAdapter.js";
import { normalizeFinancePaymentMethod } from "./financePayment.js";
import type { FinancePaymentMethod, FinanceTransactionRecord } from "./financeTypes.js";

export function buildTicketingFinanceTransaction(payload: { referensi: string; nominal: number; metodePembayaran: string }): FinanceTransactionRecord {
  const metode = normalizeFinancePaymentMethod(payload.metodePembayaran);
  const record = buildFinanceJournalAdapter({ sumber: "Ticketing", referensi: payload.referensi, nominal: payload.nominal, metodePembayaran: metode, akunKredit: "Pendapatan Tiket" });
  record.kasId = resolveCashAccountIdBySource(record.sumber);
  return record;
}

export function buildBookingFinanceTransaction(payload: { referensi: string; nominal: number; metodePembayaran: string }): FinanceTransactionRecord {
  const metode = normalizeFinancePaymentMethod(payload.metodePembayaran);
  const record = buildFinanceJournalAdapter({ sumber: "Booking", referensi: payload.referensi, nominal: payload.nominal, metodePembayaran: metode, akunKredit: "Pendapatan Booking" });
  record.kasId = resolveCashAccountIdBySource(record.sumber);
  return record;
}

export function buildCafeFinanceTransaction(payload: { referensi: string; nominal: number; metodePembayaran: string }): FinanceTransactionRecord {
  const metode = normalizeFinancePaymentMethod(payload.metodePembayaran);
  const record = buildFinanceJournalAdapter({ sumber: "Cafe", referensi: payload.referensi, nominal: payload.nominal, metodePembayaran: metode, akunKredit: "Pendapatan Cafe" });
  record.kasId = resolveCashAccountIdBySource(record.sumber);
  return record;
}

export function buildOutboundFinanceTransaction(payload: { referensi: string; nominal: number; metodePembayaran: string }): FinanceTransactionRecord {
  const metode = normalizeFinancePaymentMethod(payload.metodePembayaran);
  const record = buildFinanceJournalAdapter({ sumber: "Outbound", referensi: payload.referensi, nominal: payload.nominal, metodePembayaran: metode, akunKredit: "Pendapatan Outbound" });
  record.kasId = resolveCashAccountIdBySource(record.sumber);
  return record;
}

export function buildManualFinanceTransaction(payload: { referensi: string; nominal: number; metodePembayaran: FinancePaymentMethod; jenis?: FinanceTransactionRecord["jenis"]; kategori?: FinanceTransactionRecord["kategori"] }): FinanceTransactionRecord {
  const record = buildFinanceJournalAdapter({ sumber: "Manual", referensi: payload.referensi, nominal: payload.nominal, metodePembayaran: payload.metodePembayaran, akunKredit: "Pendapatan Lainnya" });
  record.kasId = resolveCashAccountIdBySource(record.sumber);
  if (payload.jenis) {
    record.jenis = payload.jenis;
    record.status = payload.jenis;
  }
  if (payload.kategori) {
    record.kategori = payload.kategori;
  }
  return record;
}

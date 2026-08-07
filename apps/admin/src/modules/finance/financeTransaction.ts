import type { FinanceCategory, FinancePaymentMethod, FinanceTransactionRecord, FinanceTransactionSource, FinanceTransactionType } from "./financeTypes.js";

export function generateFinanceTransactionId(now = new Date()): string {
  return `FIN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getTime()).slice(-6)}`;
}

export function createFinanceTransaction(input: {
  jenis: FinanceTransactionType;
  sumber: FinanceTransactionSource;
  kategori: FinanceCategory;
  metodePembayaran: FinancePaymentMethod;
  nominal: number;
  referensi: string;
  deskripsi: string;
  jurnal: FinanceTransactionRecord["jurnal"];
  kasId?: string;
  rekeningId?: string;
}): FinanceTransactionRecord {
  const now = new Date().toISOString();
  const id = generateFinanceTransactionId();
  return {
    id,
    name: `${input.jenis} ${input.referensi}`,
    status: input.jenis,
    jenis: input.jenis,
    sumber: input.sumber,
    kategori: input.kategori,
    metodePembayaran: input.metodePembayaran,
    nominal: Math.max(0, Number(input.nominal || 0)),
    kasId: input.kasId,
    rekeningId: input.rekeningId,
    referensi: input.referensi,
    deskripsi: input.deskripsi,
    jurnal: input.jurnal,
    dibuatPada: now,
    diperbaruiPada: now,
  };
}

export function buildFinanceDuplicateKey(record: Pick<FinanceTransactionRecord, "jenis" | "sumber" | "referensi" | "nominal">): string {
  return [record.jenis, record.sumber, record.referensi, record.nominal].join(":");
}

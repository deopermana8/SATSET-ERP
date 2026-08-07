import type { FinanceReportKey, FinanceTransactionRecord } from "./financeTypes.js";

export function buildFinanceReport(rows: FinanceTransactionRecord[], mode: FinanceReportKey) {
  if (mode === "arus-kas" || mode === "buku-kas" || mode === "ringkasan-harian") {
    return rows.map((row) => ({ tanggal: row.dibuatPada.slice(0, 10), jenis: row.jenis, sumber: row.sumber, nominal: row.nominal }));
  }
  if (mode === "rekening-bank" || mode === "rekonsiliasi") {
    return rows.filter((row) => !!row.rekeningId).map((row) => ({ referensi: row.referensi, rekeningId: row.rekeningId, nominal: row.nominal }));
  }
  if (mode === "pendapatan") {
    return rows.filter((row) => row.jenis === "Pemasukan").map((row) => ({ sumber: row.sumber, kategori: row.kategori, nominal: row.nominal }));
  }
  if (mode === "pengeluaran") {
    return rows.filter((row) => row.jenis === "Pengeluaran").map((row) => ({ sumber: row.sumber, kategori: row.kategori, nominal: row.nominal }));
  }
  return rows.map((row) => ({ bulan: row.dibuatPada.slice(0, 7), nominal: row.nominal, jenis: row.jenis }));
}

export function buildFinanceCsvReport(rows: FinanceTransactionRecord[]): string {
  const columns = ["id", "jenis", "sumber", "kategori", "metodePembayaran", "nominal", "referensi"];
  const head = columns.join(",");
  const body = rows.map((row) => columns.map((key) => `"${String((row as unknown as Record<string, unknown>)[key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${head}\n${body}`;
}

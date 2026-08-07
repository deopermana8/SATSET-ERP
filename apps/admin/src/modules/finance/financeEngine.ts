import { applyBankMutation, defaultFinanceBankAccounts } from "./financeBank.js";
import { applyCashMutation, defaultFinanceCashAccounts } from "./financeCash.js";
import { buildFinanceReport } from "./financeReport.js";
import type { FinanceDashboardSummary, FinanceTransactionRecord } from "./financeTypes.js";

export { defaultFinanceCashAccounts, defaultFinanceBankAccounts };

export function summarizeFinanceDashboard(rows: FinanceTransactionRecord[]): FinanceDashboardSummary {
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = rows.filter((row) => row.dibuatPada.slice(0, 10) === today);
  const pendapatanHariIni = todayRows.filter((row) => row.jenis === "Pemasukan").reduce((acc, row) => acc + row.nominal, 0);
  const pengeluaranHariIni = todayRows.filter((row) => row.jenis === "Pengeluaran" || row.jenis === "Refund").reduce((acc, row) => acc + row.nominal, 0);
  const pendapatanPerModul = ["Ticketing", "Booking", "Cafe", "Outbound", "Manual"].map((modul) => ({
    modul: modul as FinanceTransactionRecord["sumber"],
    nominal: rows.filter((row) => row.sumber === modul && row.jenis === "Pemasukan").reduce((acc, row) => acc + row.nominal, 0),
  }));
  const saldoKas = applyCashMutation(defaultFinanceCashAccounts.slice(), { id: "", name: "", status: "Pemasukan", jenis: "Pemasukan", sumber: "Manual", kategori: "Lainnya", metodePembayaran: "Cash", nominal: rows.reduce((acc, row) => acc + (row.jenis === "Pemasukan" ? row.nominal : -row.nominal), 0), referensi: "AGG", deskripsi: "", jurnal: { referensi: "AGG", sumber: "Manual", keterangan: "", lines: [] }, dibuatPada: today, diperbaruiPada: today } as FinanceTransactionRecord).reduce((acc, row) => acc + row.saldoSaatIni, 0);
  const saldoBank = applyBankMutation(defaultFinanceBankAccounts.slice(), { id: "", name: "", status: "Pemasukan", jenis: "Pemasukan", sumber: "Manual", kategori: "Lainnya", metodePembayaran: "Transfer", nominal: rows.filter((row) => row.metodePembayaran !== "Cash").reduce((acc, row) => acc + (row.jenis === "Pemasukan" ? row.nominal : -row.nominal), 0), referensi: "AGG", deskripsi: "", jurnal: { referensi: "AGG", sumber: "Manual", keterangan: "", lines: [] }, dibuatPada: today, diperbaruiPada: today, rekeningId: "bank-bca" } as FinanceTransactionRecord).reduce((acc, row) => acc + row.saldo, 0);
  return {
    saldoKas,
    saldoBank,
    pendapatanHariIni,
    pengeluaranHariIni,
    labaOperasionalHariIni: pendapatanHariIni - pengeluaranHariIni,
    cashFlow: pendapatanHariIni - pengeluaranHariIni,
    pendapatanPerModul,
  };
}

export function groupFinanceCharts(rows: FinanceTransactionRecord[]) {
  return {
    kas: buildFinanceReport(rows, "arus-kas"),
    pendapatan: buildFinanceReport(rows, "pendapatan"),
    pengeluaran: buildFinanceReport(rows, "pengeluaran"),
  };
}

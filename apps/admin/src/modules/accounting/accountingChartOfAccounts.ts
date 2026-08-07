import type { AccountingChartAccount } from "./accountingTypes.js";

const make = (code: string, name: string, group: AccountingChartAccount["group"], normalBalance: AccountingChartAccount["normalBalance"]): AccountingChartAccount => ({
  id: `coa-${code}`,
  code,
  name,
  group,
  normalBalance,
  active: true,
});

export const defaultChartOfAccounts: AccountingChartAccount[] = [
  make("1001", "Kas Utama", "Assets", "Debit"),
  make("1002", "Kas Loket", "Assets", "Debit"),
  make("1003", "Kas Cafe", "Assets", "Debit"),
  make("1004", "Kas Outbound", "Assets", "Debit"),
  make("1101", "Bank BCA", "Assets", "Debit"),
  make("1102", "Bank BRI", "Assets", "Debit"),
  make("2001", "Utang Usaha", "Liabilities", "Kredit"),
  make("3001", "Modal", "Equity", "Kredit"),
  make("4001", "Pendapatan Tiket", "Revenue", "Kredit"),
  make("4002", "Pendapatan Booking", "Revenue", "Kredit"),
  make("4003", "Pendapatan Cafe", "Revenue", "Kredit"),
  make("4004", "Pendapatan Outbound", "Revenue", "Kredit"),
  make("5001", "Harga Pokok Penjualan", "COGS", "Debit"),
  make("6001", "Beban Operasional", "Expense", "Debit"),
  make("6002", "Beban Gaji", "Expense", "Debit"),
  make("6003", "Beban Maintenance", "Expense", "Debit"),
  make("7001", "Pendapatan Lainnya", "Other Income", "Kredit"),
  make("8001", "Beban Lainnya", "Other Expense", "Debit"),
];

export function findAccountByCode(code: string, chart = defaultChartOfAccounts): AccountingChartAccount | null {
  return chart.find((account) => account.code === code) ?? null;
}

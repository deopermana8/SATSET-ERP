import type { FinanceCashAccount, FinanceCashAccountName, FinanceTransactionRecord } from "./financeTypes.js";

export const defaultFinanceCashAccounts: FinanceCashAccount[] = [
  { id: "kas-utama", nama: "Kas Utama", saldoAwal: 5000000, saldoSaatIni: 5000000, mutasi: 0, aktif: true },
  { id: "kas-loket", nama: "Kas Loket", saldoAwal: 1500000, saldoSaatIni: 1500000, mutasi: 0, aktif: true },
  { id: "kas-cafe", nama: "Kas Cafe", saldoAwal: 1000000, saldoSaatIni: 1000000, mutasi: 0, aktif: true },
  { id: "kas-outbound", nama: "Kas Outbound", saldoAwal: 750000, saldoSaatIni: 750000, mutasi: 0, aktif: true },
];

export function resolveCashAccountIdBySource(source: FinanceTransactionRecord["sumber"]): string {
  if (source === "Ticketing" || source === "Booking") return "kas-loket";
  if (source === "Cafe") return "kas-cafe";
  if (source === "Outbound") return "kas-outbound";
  return "kas-utama";
}

export function applyCashMutation(accounts: FinanceCashAccount[], transaction: FinanceTransactionRecord): FinanceCashAccount[] {
  return accounts.map((account) => {
    if (account.id !== (transaction.kasId || resolveCashAccountIdBySource(transaction.sumber))) {
      return account;
    }
    const direction = transaction.jenis === "Pengeluaran" || transaction.jenis === "Refund" ? -1 : 1;
    return {
      ...account,
      saldoSaatIni: account.saldoSaatIni + (direction * transaction.nominal),
      mutasi: account.mutasi + (direction * transaction.nominal),
    };
  });
}

export function findCashAccount(accounts: FinanceCashAccount[], nama: FinanceCashAccountName): FinanceCashAccount | null {
  return accounts.find((account) => account.nama === nama) ?? null;
}

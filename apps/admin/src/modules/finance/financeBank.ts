import type { FinanceBankAccount, FinanceTransactionRecord } from "./financeTypes.js";

export const defaultFinanceBankAccounts: FinanceBankAccount[] = [
  { id: "bank-bca", namaBank: "BCA", nomorRekening: "1234567890", pemilik: "SATSET ERP", saldo: 25000000, aktif: true },
  { id: "bank-bri", namaBank: "BRI", nomorRekening: "9876543210", pemilik: "SATSET ERP", saldo: 18000000, aktif: true },
];

export function applyBankMutation(accounts: FinanceBankAccount[], transaction: FinanceTransactionRecord): FinanceBankAccount[] {
  if (!transaction.rekeningId) {
    return accounts;
  }
  return accounts.map((account) => {
    if (account.id !== transaction.rekeningId) {
      return account;
    }
    const direction = transaction.jenis === "Pengeluaran" || transaction.jenis === "Refund" ? -1 : 1;
    return {
      ...account,
      saldo: account.saldo + (direction * transaction.nominal),
      rekonsiliasiTerakhir: new Date().toISOString(),
    };
  });
}

import { buildFinanceDuplicateKey } from "./financeTransaction.js";
import type { FinanceBankAccount, FinanceCashAccount, FinanceTransactionRecord, FinanceValidationResult } from "./financeTypes.js";

function result(issues: Array<{ field: string; message: string }>): FinanceValidationResult {
  return { ok: issues.length === 0, issues };
}

export function validateFinanceNominal(nominal: number): FinanceValidationResult {
  return nominal <= 0 ? result([{ field: "nominal", message: "Nominal harus lebih dari 0" }]) : result([]);
}

export function validateFinanceCashBalance(accounts: FinanceCashAccount[], transaction: FinanceTransactionRecord): FinanceValidationResult {
  if (transaction.jenis !== "Pengeluaran" && transaction.jenis !== "Refund") {
    return result([]);
  }
  const account = accounts.find((item) => item.id === transaction.kasId);
  if (account && account.saldoSaatIni < transaction.nominal) {
    return result([{ field: "kas", message: "Saldo kas tidak cukup" }]);
  }
  return result([]);
}

export function validateFinanceBankAccount(accounts: FinanceBankAccount[], rekeningId?: string): FinanceValidationResult {
  if (!rekeningId) {
    return result([]);
  }
  const account = accounts.find((item) => item.id === rekeningId);
  if (!account || !account.aktif) {
    return result([{ field: "rekening", message: "Rekening tidak aktif" }]);
  }
  return result([]);
}

export function validateFinanceDuplicate(existing: FinanceTransactionRecord[], next: FinanceTransactionRecord): FinanceValidationResult {
  const key = buildFinanceDuplicateKey(next);
  const duplicate = existing.some((record) => buildFinanceDuplicateKey(record) === key);
  return duplicate ? result([{ field: "transaksi", message: "Transaksi duplikat" }]) : result([]);
}

export function validateFinanceRefund(sourceRecord: FinanceTransactionRecord | null): FinanceValidationResult {
  if (!sourceRecord) {
    return result([{ field: "refund", message: "Transaksi sumber refund tidak ditemukan" }]);
  }
  if (sourceRecord.jenis === "Refund") {
    return result([{ field: "refund", message: "Refund tidak valid" }]);
  }
  return result([]);
}

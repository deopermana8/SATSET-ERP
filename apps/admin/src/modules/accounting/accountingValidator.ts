import { findAccountByCode } from "./accountingChartOfAccounts.js";
import type { AccountingChartAccount, AccountingJournalRecord, AccountingValidationResult } from "./accountingTypes.js";

function result(issues: Array<{ field: string; message: string }>): AccountingValidationResult {
  return { ok: issues.length === 0, issues };
}

export function validateJournalBalance(record: AccountingJournalRecord): AccountingValidationResult {
  const debit = record.lines.reduce((acc, line) => acc + Number(line.debit || 0), 0);
  const credit = record.lines.reduce((acc, line) => acc + Number(line.credit || 0), 0);
  return Math.round(debit) === Math.round(credit)
    ? result([])
    : result([{ field: "journal", message: "Total debit dan credit harus sama" }]);
}

export function validateJournalNotEmpty(record: AccountingJournalRecord): AccountingValidationResult {
  return record.lines.length > 0
    ? result([])
    : result([{ field: "journal", message: "Jurnal tidak boleh kosong" }]);
}

export function validateAccountsExist(record: AccountingJournalRecord, chart: AccountingChartAccount[]): AccountingValidationResult {
  const missing = record.lines.find((line) => !findAccountByCode(line.accountCode, chart));
  return missing
    ? result([{ field: "account", message: `Akun ${missing.accountCode} tidak ditemukan` }])
    : result([]);
}

export function validateCashAccountNonNegative(chart: AccountingChartAccount[], ledgers: Array<{ accountCode: string; endingBalance: number }>): AccountingValidationResult {
  const cashCodes = chart.filter((account) => account.name.toLowerCase().includes("kas")).map((account) => account.code);
  const negative = ledgers.find((ledger) => cashCodes.includes(ledger.accountCode) && ledger.endingBalance < 0);
  return negative
    ? result([{ field: "cash", message: `Saldo akun kas ${negative.accountCode} tidak boleh negatif` }])
    : result([]);
}

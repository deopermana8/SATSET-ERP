import { buildBalanceSheet } from "./accountingBalanceSheet.js";
import { buildCashFlow } from "./accountingCashFlow.js";
import { defaultChartOfAccounts } from "./accountingChartOfAccounts.js";
import { createClosingStatus } from "./accountingClosing.js";
import { buildIncomeStatement } from "./accountingIncomeStatement.js";
import { buildLedger } from "./accountingLedger.js";
import { buildTrialBalance, isTrialBalanceBalanced } from "./accountingTrialBalance.js";
import type { AccountingDashboardSummary, AccountingJournalRecord } from "./accountingTypes.js";

export { defaultChartOfAccounts };

export function summarizeAccounting(journals: AccountingJournalRecord[]): AccountingDashboardSummary {
  const trial = buildTrialBalance(defaultChartOfAccounts, journals);
  const income = buildIncomeStatement(trial);
  const balanceSheet = buildBalanceSheet(defaultChartOfAccounts, trial);
  const cashFlow = buildCashFlow(trial);
  const saldoKas = trial.filter((row) => row.accountCode.startsWith("10")).reduce((acc, row) => acc + row.debit - row.credit, 0);
  const saldoBank = trial.filter((row) => row.accountCode.startsWith("11")).reduce((acc, row) => acc + row.debit - row.credit, 0);
  return {
    jumlahJurnal: journals.length,
    saldoKas,
    saldoBank,
    pendapatan: income.pendapatan,
    beban: income.beban + income.hpp + income.bebanLain,
    labaBersih: income.labaBersih,
    neraca: balanceSheet.balance,
    cashFlow: cashFlow.net,
    trialBalance: isTrialBalanceBalanced(trial),
    closingStatus: createClosingStatus(new Date().toISOString().slice(0, 7)).closed ? "Tutup" : "Terbuka",
  };
}

export function buildAccountingViews(journals: AccountingJournalRecord[]) {
  const trial = buildTrialBalance(defaultChartOfAccounts, journals);
  return {
    ledgers: defaultChartOfAccounts.map((account) => buildLedger(account.code, account.name, journals)),
    trial,
    incomeStatement: buildIncomeStatement(trial),
    balanceSheet: buildBalanceSheet(defaultChartOfAccounts, trial),
    cashFlow: buildCashFlow(trial),
  };
}

import type { AccountingChartAccount, AccountingJournalRecord, AccountingTrialBalanceRow } from "./accountingTypes.js";

export function buildTrialBalance(chart: AccountingChartAccount[], journals: AccountingJournalRecord[]): AccountingTrialBalanceRow[] {
  return chart.map((account) => {
    const totals = journals.reduce((acc, journal) => {
      journal.lines.filter((line) => line.accountCode === account.code).forEach((line) => {
        acc.debit += Number(line.debit || 0);
        acc.credit += Number(line.credit || 0);
      });
      return acc;
    }, { debit: 0, credit: 0 });

    return {
      accountCode: account.code,
      accountName: account.name,
      debit: totals.debit,
      credit: totals.credit,
    };
  }).filter((row) => row.debit !== 0 || row.credit !== 0);
}

export function isTrialBalanceBalanced(rows: AccountingTrialBalanceRow[]): boolean {
  const debit = rows.reduce((acc, row) => acc + row.debit, 0);
  const credit = rows.reduce((acc, row) => acc + row.credit, 0);
  return Math.round(debit) === Math.round(credit);
}

import type { AccountingBalanceSheet, AccountingChartAccount, AccountingTrialBalanceRow } from "./accountingTypes.js";

function section(chart: AccountingChartAccount[], rows: AccountingTrialBalanceRow[], prefix: string) {
  const scoped = chart.filter((account) => account.code.startsWith(prefix)).map((account) => {
    const row = rows.find((entry) => entry.accountCode === account.code);
    const balance = account.normalBalance === "Debit"
      ? Number(row?.debit || 0) - Number(row?.credit || 0)
      : Number(row?.credit || 0) - Number(row?.debit || 0);
    return {
      accountCode: account.code,
      accountName: account.name,
      balance,
    };
  }).filter((row) => row.balance !== 0);
  return {
    total: scoped.reduce((acc, row) => acc + row.balance, 0),
    rows: scoped,
  };
}

export function buildBalanceSheet(chart: AccountingChartAccount[], rows: AccountingTrialBalanceRow[]): AccountingBalanceSheet {
  const assets = section(chart, rows, "1");
  const liabilities = section(chart, rows, "2");
  const equity = section(chart, rows, "3");
  return {
    assets,
    liabilities,
    equity,
    balance: Math.round(assets.total) === Math.round(liabilities.total + equity.total),
  };
}

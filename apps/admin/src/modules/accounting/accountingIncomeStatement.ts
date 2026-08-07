import type { AccountingIncomeStatement, AccountingTrialBalanceRow } from "./accountingTypes.js";

export function buildIncomeStatement(rows: AccountingTrialBalanceRow[]): AccountingIncomeStatement {
  const sum = (codes: string[]) => rows.filter((row) => codes.includes(row.accountCode)).reduce((acc, row) => acc + (row.credit - row.debit), 0);
  const pendapatan = sum(["4001", "4002", "4003", "4004"]);
  const hpp = rows.filter((row) => row.accountCode.startsWith("5")).reduce((acc, row) => acc + (row.debit - row.credit), 0);
  const beban = rows.filter((row) => row.accountCode.startsWith("6")).reduce((acc, row) => acc + (row.debit - row.credit), 0);
  const pendapatanLain = rows.filter((row) => row.accountCode.startsWith("7")).reduce((acc, row) => acc + (row.credit - row.debit), 0);
  const bebanLain = rows.filter((row) => row.accountCode.startsWith("8")).reduce((acc, row) => acc + (row.debit - row.credit), 0);
  const labaOperasional = pendapatan - hpp - beban;
  const labaBersih = labaOperasional + pendapatanLain - bebanLain;
  return { pendapatan, hpp, beban, labaOperasional, pendapatanLain, bebanLain, labaBersih };
}

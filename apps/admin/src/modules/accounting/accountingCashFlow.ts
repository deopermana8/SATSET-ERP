import type { AccountingCashFlow, AccountingTrialBalanceRow } from "./accountingTypes.js";

export function buildCashFlow(rows: AccountingTrialBalanceRow[]): AccountingCashFlow {
  const operating = rows.filter((row) => ["4001", "4002", "4003", "4004", "6001", "6002", "6003"].includes(row.accountCode)).reduce((acc, row) => acc + (row.credit - row.debit), 0);
  const investing = rows.filter((row) => row.accountCode.startsWith("1") && !["1001", "1002", "1003", "1004", "1101", "1102"].includes(row.accountCode)).reduce((acc, row) => acc + (row.credit - row.debit), 0);
  const financing = rows.filter((row) => row.accountCode.startsWith("2") || row.accountCode.startsWith("3")).reduce((acc, row) => acc + (row.credit - row.debit), 0);
  return {
    operating,
    investing,
    financing,
    net: operating + investing + financing,
  };
}

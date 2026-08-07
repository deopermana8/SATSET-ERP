import type { AccountingJournalRecord, AccountingLedger } from "./accountingTypes.js";

export function buildLedger(accountCode: string, accountName: string, journals: AccountingJournalRecord[], beginningBalance = 0): AccountingLedger {
  let runningBalance = beginningBalance;
  const entries = journals
    .flatMap((journal) => journal.lines
      .filter((line) => line.accountCode === accountCode)
      .map((line) => {
        runningBalance += Number(line.debit || 0) - Number(line.credit || 0);
        return {
          journalNo: journal.journalNo,
          date: journal.createdAt.slice(0, 10),
          reference: journal.reference,
          description: journal.description,
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          runningBalance,
        };
      }));

  return {
    accountCode,
    accountName,
    beginningBalance,
    debitTotal: entries.reduce((acc, entry) => acc + entry.debit, 0),
    creditTotal: entries.reduce((acc, entry) => acc + entry.credit, 0),
    endingBalance: runningBalance,
    entries,
  };
}

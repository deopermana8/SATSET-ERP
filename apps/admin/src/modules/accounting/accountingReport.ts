import type { AccountingJournalRecord, AccountingReportKey } from "./accountingTypes.js";
import { buildAccountingViews } from "./accountingEngine.js";

export function buildAccountingReport(journals: AccountingJournalRecord[], mode: AccountingReportKey) {
  const views = buildAccountingViews(journals);
  if (mode === "general-journal") return journals;
  if (mode === "ledger") return views.ledgers;
  if (mode === "trial-balance") return views.trial;
  if (mode === "income-statement") return views.incomeStatement;
  if (mode === "balance-sheet") return views.balanceSheet;
  if (mode === "cash-flow") return views.cashFlow;
  return journals.map((journal) => ({ journalNo: journal.journalNo, source: journal.source, lines: journal.lines.length }));
}

export function buildAccountingCsvReport(journals: AccountingJournalRecord[]): string {
  const head = ["journalNo", "type", "source", "reference", "posted"];
  const body = journals.map((journal) => [journal.journalNo, journal.type, journal.source, journal.reference, journal.posted].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${head.join(",")}\n${body}`;
}

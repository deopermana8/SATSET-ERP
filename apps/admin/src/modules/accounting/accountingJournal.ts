import type { AccountingJournalLine, AccountingJournalRecord, AccountingJournalType } from "./accountingTypes.js";

export function generateJournalNo(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(now.getTime()).slice(-6);
  return `JR-${y}${m}${d}-${seq}`;
}

export function createJournalRecord(input: {
  type: AccountingJournalType;
  source: AccountingJournalRecord["source"];
  reference: string;
  description: string;
  lines: AccountingJournalLine[];
}): AccountingJournalRecord {
  const now = new Date().toISOString();
  const journalNo = generateJournalNo();
  return {
    id: journalNo,
    journalNo,
    type: input.type,
    source: input.source,
    reference: input.reference,
    description: input.description,
    lines: input.lines,
    posted: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function postJournal(record: AccountingJournalRecord): AccountingJournalRecord {
  return {
    ...record,
    posted: true,
    updatedAt: new Date().toISOString(),
  };
}

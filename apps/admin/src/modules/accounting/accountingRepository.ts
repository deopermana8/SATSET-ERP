import type { RuntimeRequest } from "../runtime-core/index.js";
import { defaultChartOfAccounts } from "./accountingChartOfAccounts.js";
import type { AccountingChartAccount, AccountingClosingStatus, AccountingJournalRecord } from "./accountingTypes.js";

export type AccountingStorageAdapter = {
  read: <T>(key: string, fallback: T) => T;
  write: <T>(key: string, value: T) => T;
};

export type AccountingRepository = {
  listJournals: () => Promise<{ data: AccountingJournalRecord[]; total: number }>;
  saveJournal: (journal: AccountingJournalRecord) => Promise<AccountingJournalRecord>;
  deleteJournal: (id: string) => Promise<void>;
  listChart: () => Promise<{ data: AccountingChartAccount[]; total: number }>;
  listClosing: () => Promise<{ data: AccountingClosingStatus[]; total: number }>;
  saveClosing: (status: AccountingClosingStatus) => Promise<AccountingClosingStatus>;
};

function upsert<T extends { id: string }>(rows: T[], next: T): T[] {
  const index = rows.findIndex((row) => row.id === next.id);
  if (index >= 0) rows[index] = next;
  else rows.unshift(next);
  return rows;
}

export function createAccountingRepository(_request: RuntimeRequest, adapter: AccountingStorageAdapter): AccountingRepository {
  return {
    async listJournals() {
      const data = adapter.read<AccountingJournalRecord[]>("satset-accounting-journals", []);
      return { data, total: data.length };
    },
    async saveJournal(journal) {
      const rows = adapter.read<AccountingJournalRecord[]>("satset-accounting-journals", []);
      adapter.write("satset-accounting-journals", upsert(rows, journal));
      return journal;
    },
    async deleteJournal(id) {
      const rows = adapter.read<AccountingJournalRecord[]>("satset-accounting-journals", []).filter((row) => row.id !== id);
      adapter.write("satset-accounting-journals", rows);
    },
    async listChart() {
      const seeded = adapter.read<AccountingChartAccount[]>("satset-accounting-coa", defaultChartOfAccounts);
      adapter.write("satset-accounting-coa", seeded);
      return { data: seeded, total: seeded.length };
    },
    async listClosing() {
      const data = adapter.read<AccountingClosingStatus[]>("satset-accounting-closing", []);
      return { data, total: data.length };
    },
    async saveClosing(status) {
      const rows = adapter.read<AccountingClosingStatus[]>("satset-accounting-closing", []);
      adapter.write("satset-accounting-closing", upsert(rows as Array<AccountingClosingStatus & { id: string }>, { ...status, id: status.period } as AccountingClosingStatus & { id: string }));
      return status;
    },
  };
}

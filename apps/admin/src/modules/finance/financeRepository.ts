import type { RuntimeRequest } from "../runtime-core/index.js";
import { defaultFinanceBankAccounts } from "./financeBank.js";
import { defaultFinanceCashAccounts } from "./financeCash.js";
import type { FinanceBankAccount, FinanceCashAccount, FinanceTransactionRecord } from "./financeTypes.js";

export type FinanceStorageAdapter = {
  read: <T>(key: string, fallback: T) => T;
  write: <T>(key: string, value: T) => T;
};

export type FinanceRepository = {
  listTransactions: () => Promise<{ data: FinanceTransactionRecord[]; total: number }>;
  saveTransaction: (record: FinanceTransactionRecord) => Promise<FinanceTransactionRecord>;
  deleteTransaction: (id: string) => Promise<void>;
  listCashAccounts: () => Promise<{ data: FinanceCashAccount[]; total: number }>;
  saveCashAccounts: (rows: FinanceCashAccount[]) => Promise<FinanceCashAccount[]>;
  listBankAccounts: () => Promise<{ data: FinanceBankAccount[]; total: number }>;
  saveBankAccounts: (rows: FinanceBankAccount[]) => Promise<FinanceBankAccount[]>;
};

function upsert<T extends { id: string }>(rows: T[], next: T): T[] {
  const index = rows.findIndex((row) => row.id === next.id);
  if (index >= 0) rows[index] = next;
  else rows.unshift(next);
  return rows;
}

export function createFinanceRepository(_request: RuntimeRequest, adapter: FinanceStorageAdapter): FinanceRepository {
  return {
    async listTransactions() {
      const data = adapter.read<FinanceTransactionRecord[]>("satset-finance-transactions", []);
      return { data, total: data.length };
    },
    async saveTransaction(record) {
      const rows = adapter.read<FinanceTransactionRecord[]>("satset-finance-transactions", []);
      adapter.write("satset-finance-transactions", upsert(rows, record));
      return record;
    },
    async deleteTransaction(id) {
      const rows = adapter.read<FinanceTransactionRecord[]>("satset-finance-transactions", []).filter((row) => row.id !== id);
      adapter.write("satset-finance-transactions", rows);
    },
    async listCashAccounts() {
      const seeded = adapter.read<FinanceCashAccount[]>("satset-finance-cash", defaultFinanceCashAccounts);
      adapter.write("satset-finance-cash", seeded);
      return { data: seeded, total: seeded.length };
    },
    async saveCashAccounts(rows) {
      adapter.write("satset-finance-cash", rows);
      return rows;
    },
    async listBankAccounts() {
      const seeded = adapter.read<FinanceBankAccount[]>("satset-finance-bank", defaultFinanceBankAccounts);
      adapter.write("satset-finance-bank", seeded);
      return { data: seeded, total: seeded.length };
    },
    async saveBankAccounts(rows) {
      adapter.write("satset-finance-bank", rows);
      return rows;
    },
  };
}

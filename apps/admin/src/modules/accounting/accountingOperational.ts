import { defaultChartOfAccounts } from "./accountingChartOfAccounts.js";
import { createJournalRecord } from "./accountingJournal.js";
import type { AccountingJournalRecord, AccountingOperationalEnvelope } from "./accountingTypes.js";

function creditAccountBySource(source: string): { code: string; name: string } {
  if (source === "Ticketing") return { code: "4001", name: "Pendapatan Tiket" };
  if (source === "Booking") return { code: "4002", name: "Pendapatan Booking" };
  if (source === "Cafe") return { code: "4003", name: "Pendapatan Cafe" };
  if (source === "Outbound") return { code: "4004", name: "Pendapatan Outbound" };
  return { code: "7001", name: "Pendapatan Lainnya" };
}

function debitAccountByMethod(method: string): { code: string; name: string } {
  if (method === "Cash") return { code: "1001", name: "Kas Utama" };
  if (method === "QRIS") return { code: "1101", name: "Bank BCA" };
  if (method === "Transfer" || method === "VA" || method === "EDC") return { code: "1102", name: "Bank BRI" };
  return { code: "1001", name: "Kas Utama" };
}

export function createJournalFromFinanceEnvelope(envelope: AccountingOperationalEnvelope): AccountingJournalRecord | null {
  const tx = envelope.financeTransaction;
  if (!tx) return null;
  const debit = debitAccountByMethod(tx.metodePembayaran);
  const credit = creditAccountBySource(tx.sumber);
  return createJournalRecord({
    type: tx.jenis === "Pemasukan" ? "Cash Receipt" : tx.jenis === "Pengeluaran" ? "Cash Payment" : "General Journal",
    source: tx.sumber,
    reference: tx.referensi,
    description: tx.deskripsi,
    lines: [
      { accountCode: debit.code, accountName: debit.name, debit: tx.nominal, credit: 0, memo: tx.deskripsi },
      { accountCode: credit.code, accountName: credit.name, debit: 0, credit: tx.nominal, memo: tx.deskripsi },
    ],
  });
}

export function defaultAccountingChart() {
  return defaultChartOfAccounts.slice();
}

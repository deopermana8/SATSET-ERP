import type { FinanceTransactionRecord } from "../finance/financeTypes.js";

export const accountingAccountGroups = ["Assets", "Liabilities", "Equity", "Revenue", "COGS", "Expense", "Other Income", "Other Expense"] as const;
export type AccountingAccountGroup = (typeof accountingAccountGroups)[number];

export const accountingJournalTypes = ["General Journal", "Cash Receipt", "Cash Payment", "Adjustment", "Opening Balance", "Closing", "Reversal"] as const;
export type AccountingJournalType = (typeof accountingJournalTypes)[number];

export type AccountingChartAccount = {
  id: string;
  code: string;
  name: string;
  group: AccountingAccountGroup;
  normalBalance: "Debit" | "Kredit";
  active: boolean;
};

export type AccountingJournalLine = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
};

export type AccountingJournalRecord = {
  id: string;
  journalNo: string;
  type: AccountingJournalType;
  source: "Finance" | "Ticketing" | "Booking" | "Cafe" | "Outbound" | "Manual";
  reference: string;
  description: string;
  lines: AccountingJournalLine[];
  posted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccountingLedgerEntry = {
  journalNo: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
};

export type AccountingLedger = {
  accountCode: string;
  accountName: string;
  beginningBalance: number;
  debitTotal: number;
  creditTotal: number;
  endingBalance: number;
  entries: AccountingLedgerEntry[];
};

export type AccountingTrialBalanceRow = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type AccountingIncomeStatement = {
  pendapatan: number;
  hpp: number;
  beban: number;
  labaOperasional: number;
  pendapatanLain: number;
  bebanLain: number;
  labaBersih: number;
};

export type AccountingBalanceSheetSection = {
  total: number;
  rows: Array<{ accountCode: string; accountName: string; balance: number }>;
};

export type AccountingBalanceSheet = {
  assets: AccountingBalanceSheetSection;
  liabilities: AccountingBalanceSheetSection;
  equity: AccountingBalanceSheetSection;
  balance: boolean;
};

export type AccountingCashFlow = {
  operating: number;
  investing: number;
  financing: number;
  net: number;
};

export type AccountingClosingStatus = {
  period: string;
  closed: boolean;
  closedAt?: string;
};

export type AccountingValidationIssue = {
  field: string;
  message: string;
};

export type AccountingValidationResult = {
  ok: boolean;
  issues: AccountingValidationIssue[];
};

export type AccountingDashboardSummary = {
  jumlahJurnal: number;
  saldoKas: number;
  saldoBank: number;
  pendapatan: number;
  beban: number;
  labaBersih: number;
  neraca: boolean;
  cashFlow: number;
  trialBalance: boolean;
  closingStatus: string;
};

export type AccountingReportKey = "general-journal" | "ledger" | "trial-balance" | "income-statement" | "balance-sheet" | "cash-flow" | "journal-detail";

export type AccountingOperationalEnvelope = {
  financeTransaction?: FinanceTransactionRecord;
  metadata?: Record<string, unknown>;
};

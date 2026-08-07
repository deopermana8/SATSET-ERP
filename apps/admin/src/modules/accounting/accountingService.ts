import type { RuntimeRequest } from "../runtime-core/index.js";
import { buildAccountingViews, summarizeAccounting } from "./accountingEngine.js";
import { closePeriod, createClosingStatus } from "./accountingClosing.js";
import { createAccountingRepository, type AccountingStorageAdapter } from "./accountingRepository.js";
import { buildAccountingReport, buildAccountingCsvReport } from "./accountingReport.js";
import { validateAccountsExist, validateCashAccountNonNegative, validateJournalBalance, validateJournalNotEmpty } from "./accountingValidator.js";
import { buildLedger } from "./accountingLedger.js";
import type { AccountingJournalRecord, AccountingReportKey } from "./accountingTypes.js";

export function createAccountingService(request: RuntimeRequest, adapter: AccountingStorageAdapter) {
  const repository = createAccountingRepository(request, adapter);

  return {
    repository,
    loadJournals: () => repository.listJournals(),
    loadChart: () => repository.listChart(),
    loadClosing: () => repository.listClosing(),
    async saveJournal(record: AccountingJournalRecord) {
      const chart = (await repository.listChart()).data;
      const journals = (await repository.listJournals()).data;
      const views = buildAccountingViews(journals.concat(record));
      const issues = [
        ...validateJournalNotEmpty(record).issues,
        ...validateJournalBalance(record).issues,
        ...validateAccountsExist(record, chart).issues,
        ...validateCashAccountNonNegative(chart, views.ledgers.map((ledger) => ({ accountCode: ledger.accountCode, endingBalance: ledger.endingBalance }))).issues,
      ];
      if (issues.length) {
        throw new Error(issues[0].message);
      }
      return repository.saveJournal(record);
    },
    deleteJournal: (id: string) => repository.deleteJournal(id),
    summarize: summarizeAccounting,
    views: buildAccountingViews,
    report: (journals: AccountingJournalRecord[], mode: AccountingReportKey) => buildAccountingReport(journals, mode),
    exportCsv: (journals: AccountingJournalRecord[]) => buildAccountingCsvReport(journals),
    async closeBook(period: string) {
      const status = closePeriod(createClosingStatus(period));
      return repository.saveClosing(status);
    },
  };
}

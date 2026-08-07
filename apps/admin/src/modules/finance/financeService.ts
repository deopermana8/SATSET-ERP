import type { RuntimeRequest } from "../runtime-core/index.js";
import { applyBankMutation } from "./financeBank.js";
import { applyCashMutation } from "./financeCash.js";
import { groupFinanceCharts, summarizeFinanceDashboard } from "./financeEngine.js";
import { buildFinanceCsvReport, buildFinanceReport } from "./financeReport.js";
import { createFinanceRepository, type FinanceStorageAdapter } from "./financeRepository.js";
import { validateFinanceBankAccount, validateFinanceCashBalance, validateFinanceDuplicate, validateFinanceNominal, validateFinanceRefund } from "./financeValidator.js";
import type { FinanceReportKey, FinanceTransactionRecord } from "./financeTypes.js";

export function createFinanceService(request: RuntimeRequest, adapter: FinanceStorageAdapter) {
  const repository = createFinanceRepository(request, adapter);

  return {
    repository,
    loadTransactions: () => repository.listTransactions(),
    loadCashAccounts: () => repository.listCashAccounts(),
    loadBankAccounts: () => repository.listBankAccounts(),
    async saveTransaction(record: FinanceTransactionRecord) {
      const existing = (await repository.listTransactions()).data;
      const cashAccounts = (await repository.listCashAccounts()).data;
      const bankAccounts = (await repository.listBankAccounts()).data;
      const issues = [
        ...validateFinanceNominal(record.nominal).issues,
        ...validateFinanceDuplicate(existing, record).issues,
        ...validateFinanceCashBalance(cashAccounts, record).issues,
        ...validateFinanceBankAccount(bankAccounts, record.rekeningId).issues,
      ];
      if (issues.length) {
        throw new Error(issues[0].message);
      }
      await repository.saveCashAccounts(applyCashMutation(cashAccounts, record));
      await repository.saveBankAccounts(applyBankMutation(bankAccounts, record));
      return repository.saveTransaction(record);
    },
    deleteTransaction: (id: string) => repository.deleteTransaction(id),
    validateRefund: validateFinanceRefund,
    summarizeDashboard: summarizeFinanceDashboard,
    chartData: groupFinanceCharts,
    report: (rows: FinanceTransactionRecord[], mode: FinanceReportKey) => buildFinanceReport(rows, mode),
    exportCsv: (rows: FinanceTransactionRecord[]) => buildFinanceCsvReport(rows),
  };
}

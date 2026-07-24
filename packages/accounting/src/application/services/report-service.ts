import { AccountingService } from "./accounting-service";

export class ReportService {
  constructor(private readonly accountingService: AccountingService) {}

  public generalJournal() {
    return this.accountingService.listJournalEntries();
  }

  public generalLedger() {
    return this.accountingService.buildLedgers();
  }

  public trialBalance() {
    return this.accountingService.buildTrialBalance();
  }

  public balanceSheet() {
    return this.accountingService.buildBalanceSheet();
  }

  public incomeStatement() {
    return this.accountingService.buildIncomeStatement();
  }

  public cashFlow() {
    return this.accountingService.buildCashFlow();
  }

  public dailySales() {
    const byDate = new Map<string, number>();
    for (const entry of this.accountingService.listJournalEntries()) {
      const amount = entry.lines
        .filter((line) => line.accountCode === "4000" && line.side === "credit")
        .reduce((sum, line) => sum + line.amount, 0);

      if (amount === 0) {
        continue;
      }

      const dateKey = entry.occurredAt.toISOString().slice(0, 10);
      byDate.set(dateKey, (byDate.get(dateKey) ?? 0) + amount);
    }

    return Array.from(byDate.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((left, right) => left.date.localeCompare(right.date));
  }

  public monthlySales() {
    const byMonth = new Map<string, number>();
    for (const entry of this.accountingService.listJournalEntries()) {
      const amount = entry.lines
        .filter((line) => line.accountCode === "4000" && line.side === "credit")
        .reduce((sum, line) => sum + line.amount, 0);

      if (amount === 0) {
        continue;
      }

      const monthKey = entry.occurredAt.toISOString().slice(0, 7);
      byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + amount);
    }

    return Array.from(byMonth.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((left, right) => left.month.localeCompare(right.month));
  }

  public expenseReport() {
    const byAccount = new Map<string, { accountName: string; total: number }>();
    for (const entry of this.accountingService.listJournalEntries()) {
      for (const line of entry.lines.filter((item) => item.accountCode.startsWith("6") && item.side === "debit")) {
        const current = byAccount.get(line.accountCode) ?? { accountName: line.accountName, total: 0 };
        current.total += line.amount;
        byAccount.set(line.accountCode, current);
      }
    }

    return Array.from(byAccount.entries())
      .map(([accountCode, value]) => ({ accountCode, accountName: value.accountName, total: value.total }))
      .sort((left, right) => left.accountCode.localeCompare(right.accountCode));
  }

  public inventoryValuation() {
    const inventoryLedger = this.accountingService.buildLedgers().find((ledger) => ledger.accountCode === "1200");
    return {
      accountCode: inventoryLedger?.accountCode ?? "1200",
      accountName: inventoryLedger?.accountName ?? "Inventory",
      closingBalance: inventoryLedger?.closingBalance ?? 0,
      debitTotal: inventoryLedger?.debitTotal ?? 0,
      creditTotal: inventoryLedger?.creditTotal ?? 0,
    };
  }
}
import { WorkflowDashboardStore, type JournalEntryDraft, type JournalPostingPort, type JournalPostingResult } from "@satset/shared";
import {
  BalanceSheet,
  ChartOfAccount,
  ClosingPeriod,
  CashFlow,
  FiscalPeriod,
  IncomeStatement,
  JournalEntry,
  JournalLine,
  Ledger,
  STANDARD_CHART_OF_ACCOUNTS,
  TrialBalance,
  type AccountCategory,
  type NormalBalance,
  type PeriodStatus,
} from "../../domain/accounting-domain";
import { JournalCreated } from "../../domain/events/journal-created";

export type AccountingServiceResult<T> = {
  item: T;
  events: Array<JournalCreated>;
};

type PostingState = {
  chartOfAccounts: Map<string, ChartOfAccount>;
  journalEntries: Array<JournalEntry>;
  fiscalPeriods: Map<string, FiscalPeriod>;
  periodStatuses: Map<string, PeriodStatus>;
  closingPeriods: Array<ClosingPeriod>;
};

export class AccountingService implements JournalPostingPort<JournalEntry> {
  private readonly state: PostingState = {
    chartOfAccounts: new Map<string, ChartOfAccount>(),
    journalEntries: [],
    fiscalPeriods: new Map<string, FiscalPeriod>(),
    periodStatuses: new Map<string, PeriodStatus>(),
    closingPeriods: [],
  };

  private sequence = 1;

  constructor(private readonly dashboard: WorkflowDashboardStore) {
    this.seedStandardChartOfAccounts();
  }

  public seedStandardChartOfAccounts(): void {
    for (const account of STANDARD_CHART_OF_ACCOUNTS) {
      if (!this.state.chartOfAccounts.has(account.code)) {
        this.state.chartOfAccounts.set(account.code, new ChartOfAccount(`coa-${account.code}`, account));
      }
    }
  }

  public createChartOfAccount(params: {
    code: string;
    name: string;
    category: AccountCategory;
    normalBalance: NormalBalance;
    parentCode?: string;
    openingBalance?: number;
  }): ChartOfAccount {
    const item = new ChartOfAccount(`coa-${params.code}`, {
      code: params.code,
      name: params.name,
      category: params.category,
      normalBalance: params.normalBalance,
      parentCode: params.parentCode,
      openingBalance: params.openingBalance ?? 0,
      isActive: true,
    });

    this.state.chartOfAccounts.set(item.code, item);
    return item;
  }

  public postJournalDraft(draft: JournalEntryDraft): JournalPostingResult<JournalEntry> {
    const lines = draft.lines.map((line, index) => new JournalLine(`${draft.entryNumber}-${index + 1}`, line));
    const entry = new JournalEntry(`journal-${draft.entryNumber}`, {
      entryNumber: draft.entryNumber,
      description: draft.description,
      reference: draft.reference,
      occurredAt: draft.occurredAt,
      lines,
    });

    this.state.journalEntries.push(entry);
    this.dashboard.increment("journalEntries");

    return { item: entry, entryNumber: entry.entryNumber };
  }

  public createJournal(params: {
    journalNumber: string;
    description: string;
    reference?: string;
    occurredAt?: Date;
    lines: Array<{ accountCode: string; side: "debit" | "credit"; amount: number; memo?: string }>;
  }): AccountingServiceResult<JournalEntry> {
    const chartOfAccounts = this.state.chartOfAccounts;
    const draft: JournalEntryDraft = {
      entryNumber: params.journalNumber,
      description: params.description,
      reference: params.reference,
      occurredAt: params.occurredAt ?? new Date(),
      lines: params.lines.map((line) => {
        const account = chartOfAccounts.get(line.accountCode);
        if (!account) {
          throw new Error(`Chart of account ${line.accountCode} is not registered`);
        }

        return {
          accountCode: account.code,
          accountName: account.name,
          side: line.side,
          amount: line.amount,
          memo: line.memo,
        };
      }),
    };

    const posting = this.postJournalDraft(draft);
    const event = new JournalCreated({
      journalNumber: posting.item.entryNumber,
      description: posting.item.description,
      debit: posting.item.totalDebit,
      credit: posting.item.totalCredit,
      occurredAt: posting.item.occurredAt,
    });

    return { item: posting.item, events: [event] };
  }

  public openFiscalPeriod(params: { name: string; startDate: Date; endDate: Date }): FiscalPeriod {
    const item = new FiscalPeriod(`period-${this.sequence++}`, {
      name: params.name,
      startDate: params.startDate,
      endDate: params.endDate,
      status: "open",
    });

    this.state.fiscalPeriods.set(item.id, item);
    this.state.periodStatuses.set(item.id, "open");
    return item;
  }

  public listFiscalPeriods(): Array<FiscalPeriod> {
    return Array.from(this.state.fiscalPeriods.values()).map((period) => new FiscalPeriod(period.id, {
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      status: this.state.periodStatuses.get(period.id) ?? period.status,
    }));
  }

  public listJournalEntries(): Array<JournalEntry> {
    return [...this.state.journalEntries];
  }

  public buildLedgers(): Array<Ledger> {
    const ledgers = new Map<string, Ledger>();
    for (const account of this.state.chartOfAccounts.values()) {
      const journalLines = this.state.journalEntries.flatMap((entry) => entry.lines.filter((line) => line.accountCode === account.code));
      const debitTotal = journalLines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amount, 0);
      const creditTotal = journalLines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amount, 0);
      const closingBalance = this.calculateClosingBalance(account.normalBalance, account.openingBalance, debitTotal, creditTotal);

      ledgers.set(account.code, new Ledger(`ledger-${account.code}`, {
        accountCode: account.code,
        accountName: account.name,
        category: account.category,
        normalBalance: account.normalBalance,
        openingBalance: account.openingBalance,
        debitTotal,
        creditTotal,
        closingBalance,
      }));
    }

    return [...ledgers.values()].sort((left, right) => left.accountCode.localeCompare(right.accountCode));
  }

  public buildTrialBalance(): TrialBalance {
    const ledgers = this.buildLedgers();
    return new TrialBalance(`trial-balance-${this.sequence++}`, {
      ledgers,
      totalDebit: ledgers.reduce((sum, ledger) => sum + ledger.debitTotal, 0),
      totalCredit: ledgers.reduce((sum, ledger) => sum + ledger.creditTotal, 0),
    });
  }

  public buildIncomeStatement(): IncomeStatement {
    const ledgers = this.buildLedgers();
    const revenues = ledgers.filter((ledger) => ledger.category === "revenue");
    const expenses = ledgers.filter((ledger) => ledger.category === "expense");
    const totalRevenue = revenues.reduce((sum, ledger) => sum + ledger.closingBalance, 0);
    const totalExpense = expenses.reduce((sum, ledger) => sum + ledger.closingBalance, 0);

    return new IncomeStatement(`income-statement-${this.sequence++}`, {
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netIncome: totalRevenue - totalExpense,
    });
  }

  public buildBalanceSheet(): BalanceSheet {
    const ledgers = this.buildLedgers();
    const assets = ledgers.filter((ledger) => ledger.category === "asset");
    const liabilities = ledgers.filter((ledger) => ledger.category === "liability");
    const equity = ledgers.filter((ledger) => ledger.category === "equity");

    return new BalanceSheet(`balance-sheet-${this.sequence++}`, {
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((sum, ledger) => sum + ledger.closingBalance, 0),
      totalLiabilities: liabilities.reduce((sum, ledger) => sum + ledger.closingBalance, 0),
      totalEquity: equity.reduce((sum, ledger) => sum + ledger.closingBalance, 0),
    });
  }

  public buildCashFlow(): CashFlow {
    let operating = 0;
    let investing = 0;
    let financing = 0;

    for (const entry of this.state.journalEntries) {
      const cashLines = entry.lines.filter((line) => this.isCashAccount(line.accountCode));
      if (!cashLines.length) {
        continue;
      }

      const nonCashCategories = entry.lines
        .filter((line) => !this.isCashAccount(line.accountCode))
        .map((line) => this.state.chartOfAccounts.get(line.accountCode)?.category)
        .filter((category): category is AccountCategory => category !== undefined);

      const cashChange = cashLines.reduce((sum, line) => sum + (line.side === "debit" ? line.amount : -line.amount), 0);

      if (nonCashCategories.some((category) => category === "revenue" || category === "expense" || category === "liability")) {
        operating += cashChange;
      } else if (nonCashCategories.some((category) => category === "asset")) {
        investing += cashChange;
      } else {
        financing += cashChange;
      }
    }

    return new CashFlow(`cash-flow-${this.sequence++}`, {
      operating,
      investing,
      financing,
      netChangeInCash: operating + investing + financing,
    });
  }

  public closeFiscalPeriod(periodId: string): ClosingPeriod {
    const period = this.state.fiscalPeriods.get(periodId);
    if (!period) {
      throw new Error(`Fiscal period ${periodId} not found`);
    }

    const incomeStatement = this.buildIncomeStatement();
    const closingLines: Array<{ accountCode: string; accountName: string; side: "debit" | "credit"; amount: number }> = [];

    for (const revenue of incomeStatement.revenues) {
      if (revenue.closingBalance > 0) {
        closingLines.push({ accountCode: revenue.accountCode, accountName: revenue.accountName, side: "debit", amount: revenue.closingBalance });
      }
    }

    for (const expense of incomeStatement.expenses) {
      if (expense.closingBalance > 0) {
        closingLines.push({ accountCode: expense.accountCode, accountName: expense.accountName, side: "credit", amount: expense.closingBalance });
      }
    }

    const retainedEarnings = incomeStatement.netIncome;
    if (retainedEarnings > 0) {
      closingLines.push({ accountCode: "3000", accountName: "Retained Earnings", side: "credit", amount: retainedEarnings });
    } else if (retainedEarnings < 0) {
      closingLines.push({ accountCode: "3000", accountName: "Retained Earnings", side: "debit", amount: Math.abs(retainedEarnings) });
    }

    let closingJournalEntryNumber = "NO-ACTIVITY";
    if (closingLines.length >= 2) {
      closingJournalEntryNumber = `CL-${this.sequence++}`;
      this.postJournalDraft({
        entryNumber: closingJournalEntryNumber,
        description: `Closing period ${period.name}`,
        reference: period.id,
        occurredAt: new Date(),
        lines: closingLines,
      });
    }

    this.state.periodStatuses.set(period.id, "closed");

    const closingPeriod = new ClosingPeriod(`closing-${period.id}`, {
      fiscalPeriodId: period.id,
      closingJournalEntryNumber,
      closedAt: new Date(),
      retainedEarnings,
    });

    this.state.closingPeriods.push(closingPeriod);
    return closingPeriod;
  }

  public listClosingPeriods(): Array<ClosingPeriod> {
    return [...this.state.closingPeriods];
  }

  public snapshot() {
    return {
      chartOfAccounts: [...this.state.chartOfAccounts.values()],
      journalEntries: [...this.state.journalEntries],
      fiscalPeriods: this.listFiscalPeriods(),
      closingPeriods: [...this.state.closingPeriods],
      trialBalance: this.buildTrialBalance(),
      balanceSheet: this.buildBalanceSheet(),
      incomeStatement: this.buildIncomeStatement(),
      cashFlow: this.buildCashFlow(),
    };
  }

  private calculateClosingBalance(normalBalance: NormalBalance, openingBalance: number, debitTotal: number, creditTotal: number): number {
    return normalBalance === "debit"
      ? openingBalance + debitTotal - creditTotal
      : openingBalance + creditTotal - debitTotal;
  }

  private isCashAccount(accountCode: string): boolean {
    return accountCode === "1010" || accountCode === "1020";
  }
}

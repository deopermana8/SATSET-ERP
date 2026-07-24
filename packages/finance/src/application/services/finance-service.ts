import {
  FINANCE_ACCOUNTS,
  BankAccount,
  BankTransaction,
  CashAccount,
  CashMutation,
  CashTransaction,
  DailyClosing,
  Expense,
  Income,
  PettyCash,
  Transfer,
  type FinanceTransactionDirection,
} from "../../domain/finance-domain";

type JournalSide = "debit" | "credit";

type JournalLineDraft = {
  accountCode: string;
  accountName: string;
  side: JournalSide;
  amount: number;
  memo?: string;
};

type JournalEntryDraft = {
  entryNumber: string;
  description: string;
  reference?: string;
  occurredAt: Date;
  lines: Array<JournalLineDraft>;
};

type JournalPostingResult<T> = {
  item: T;
  entryNumber: string;
};

interface JournalPostingPort<T> {
  postJournalDraft(draft: JournalEntryDraft): JournalPostingResult<T>;
}

type WorkflowDashboardStore = {
  increment(metric: "financeTransactions", value?: number): void;
};

export type FinanceServiceResult<T> = {
  item: T;
  journal?: JournalPostingResult<unknown>;
};

export class FinanceService {
  private readonly cashAccounts = new Map<string, CashAccount>();
  private readonly bankAccounts = new Map<string, BankAccount>();
  private readonly cashTransactions: Array<CashTransaction> = [];
  private readonly bankTransactions: Array<BankTransaction> = [];
  private readonly expenses: Array<Expense> = [];
  private readonly incomes: Array<Income> = [];
  private readonly transfers: Array<Transfer> = [];
  private readonly pettyCashAccounts: Array<PettyCash> = [];
  private readonly cashMutations: Array<CashMutation> = [];
  private readonly dailyClosings: Array<DailyClosing> = [];
  private sequence = 1;

  constructor(
    private readonly dashboard: WorkflowDashboardStore,
    private readonly journalPort?: JournalPostingPort<unknown>,
  ) {}

  public createCashAccount(params: {
    code: string;
    name: string;
    openingBalance?: number;
    currency?: string;
  }): CashAccount {
    const item = new CashAccount(`cash-account-${params.code}`, {
      code: params.code,
      name: params.name,
      openingBalance: params.openingBalance ?? 0,
      currentBalance: params.openingBalance ?? 0,
      currency: params.currency ?? "IDR",
      status: "active",
    });

    this.cashAccounts.set(item.code, item);
    return item;
  }

  public createBankAccount(params: {
    code: string;
    name: string;
    bankName: string;
    accountNumber: string;
    openingBalance?: number;
    currency?: string;
  }): BankAccount {
    const item = new BankAccount(`bank-account-${params.code}`, {
      code: params.code,
      name: params.name,
      bankName: params.bankName,
      accountNumber: params.accountNumber,
      openingBalance: params.openingBalance ?? 0,
      currentBalance: params.openingBalance ?? 0,
      currency: params.currency ?? "IDR",
      status: "active",
    });

    this.bankAccounts.set(item.code, item);
    return item;
  }

  public recordCashTransaction(params: {
    accountCode: string;
    reference: string;
    amount: number;
    direction: FinanceTransactionDirection;
    description: string;
    occurredAt?: Date;
  }): FinanceServiceResult<CashTransaction> {
    const item = new CashTransaction(`cash-tx-${this.sequence++}`, {
      accountCode: params.accountCode,
      reference: params.reference,
      amount: params.amount,
      direction: params.direction,
      description: params.description,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.cashTransactions.push(item);
    this.dashboard.increment("financeTransactions");
    return { item, journal: this.postJournal(this.toBalancedJournal(`FN-${this.sequence}`, item.description, item.reference, item.occurredAt, [
      { accountCode: item.accountCode, accountName: FINANCE_ACCOUNTS.cash.name, side: item.direction === "inflow" ? "debit" : "credit", amount: item.amount },
      { accountCode: FINANCE_ACCOUNTS.sales.code, accountName: FINANCE_ACCOUNTS.sales.name, side: item.direction === "inflow" ? "credit" : "debit", amount: item.amount },
    ])) };
  }

  public recordBankTransaction(params: {
    accountCode: string;
    reference: string;
    amount: number;
    direction: FinanceTransactionDirection;
    description: string;
    occurredAt?: Date;
  }): FinanceServiceResult<BankTransaction> {
    const item = new BankTransaction(`bank-tx-${this.sequence++}`, {
      accountCode: params.accountCode,
      reference: params.reference,
      amount: params.amount,
      direction: params.direction,
      description: params.description,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.bankTransactions.push(item);
    this.dashboard.increment("financeTransactions");
    return { item };
  }

  public recordExpense(params: {
    reference: string;
    category: string;
    amount: number;
    description: string;
    paidFromAccountCode?: string;
    occurredAt?: Date;
  }): FinanceServiceResult<Expense> {
    const item = new Expense(`expense-${this.sequence++}`, {
      reference: params.reference,
      category: params.category,
      amount: params.amount,
      description: params.description,
      paidFromAccountCode: params.paidFromAccountCode ?? FINANCE_ACCOUNTS.cash.code,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.expenses.push(item);
    this.dashboard.increment("financeTransactions");
    return {
      item,
      journal: this.postJournal(this.toBalancedJournal(`EX-${this.sequence}`, item.description, item.reference, item.occurredAt, [
        { accountCode: FINANCE_ACCOUNTS.expense.code, accountName: FINANCE_ACCOUNTS.expense.name, side: "debit", amount: item.amount },
        { accountCode: item.paidFromAccountCode, accountName: FINANCE_ACCOUNTS.cash.name, side: "credit", amount: item.amount },
      ])),
    };
  }

  public recordIncome(params: {
    reference: string;
    source: string;
    amount: number;
    description: string;
    receivedToAccountCode?: string;
    occurredAt?: Date;
  }): FinanceServiceResult<Income> {
    const item = new Income(`income-${this.sequence++}`, {
      reference: params.reference,
      source: params.source,
      amount: params.amount,
      description: params.description,
      receivedToAccountCode: params.receivedToAccountCode ?? FINANCE_ACCOUNTS.cash.code,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.incomes.push(item);
    this.dashboard.increment("financeTransactions");
    return { item };
  }

  public transferCash(params: {
    reference: string;
    fromAccountCode: string;
    toAccountCode: string;
    amount: number;
    fee?: number;
    description: string;
    direction?: "cash-to-bank" | "bank-to-cash" | "cash-to-cash" | "bank-to-bank";
    occurredAt?: Date;
  }): FinanceServiceResult<Transfer> {
    const item = new Transfer(`transfer-${this.sequence++}`, {
      reference: params.reference,
      fromAccountCode: params.fromAccountCode,
      toAccountCode: params.toAccountCode,
      amount: params.amount,
      fee: params.fee ?? 0,
      direction: params.direction ?? "cash-to-bank",
      description: params.description,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.transfers.push(item);
    this.dashboard.increment("financeTransactions");
    return { item };
  }

  public createPettyCash(params: {
    reference: string;
    holderName: string;
    cashAccountCode: string;
    openingBalance: number;
    limitAmount: number;
    openedAt?: Date;
  }): PettyCash {
    const item = new PettyCash(`petty-cash-${this.sequence++}`, {
      reference: params.reference,
      holderName: params.holderName,
      cashAccountCode: params.cashAccountCode,
      openingBalance: params.openingBalance,
      currentBalance: params.openingBalance,
      limitAmount: params.limitAmount,
      openedAt: params.openedAt ?? new Date(),
    });

    this.pettyCashAccounts.push(item);
    this.dashboard.increment("financeTransactions");
    return item;
  }

  public mutatePettyCash(params: {
    pettyCashReference: string;
    type: "top-up" | "usage" | "adjustment";
    amount: number;
    description: string;
    occurredAt?: Date;
  }): CashMutation {
    const item = new CashMutation(`cash-mutation-${this.sequence++}`, {
      pettyCashReference: params.pettyCashReference,
      type: params.type,
      amount: params.amount,
      description: params.description,
      occurredAt: params.occurredAt ?? new Date(),
    });

    this.cashMutations.push(item);
    this.dashboard.increment("financeTransactions");
    return item;
  }

  public closeDailyCash(params: {
    closingDate: Date;
    openingCash: number;
    closingCash: number;
    expectedCash: number;
    notes?: string;
    approvedAt?: Date;
  }): DailyClosing {
    const item = new DailyClosing(`daily-closing-${this.sequence++}`, {
      closingDate: params.closingDate,
      openingCash: params.openingCash,
      closingCash: params.closingCash,
      expectedCash: params.expectedCash,
      variance: params.closingCash - params.expectedCash,
      notes: params.notes ?? "",
      approvedAt: params.approvedAt ?? new Date(),
    });

    this.dailyClosings.push(item);
    this.dashboard.increment("financeTransactions");
    return item;
  }

  public recordReservationPaid(params: {
    reference: string;
    amount: number;
    description: string;
    occurredAt?: Date;
  }): FinanceServiceResult<unknown> {
    const draft = this.toBalancedJournal(`RV-${this.sequence++}`, params.description, params.reference, params.occurredAt ?? new Date(), [
      { accountCode: FINANCE_ACCOUNTS.cash.code, accountName: FINANCE_ACCOUNTS.cash.name, side: "debit", amount: params.amount },
      { accountCode: FINANCE_ACCOUNTS.unearnedRevenue.code, accountName: FINANCE_ACCOUNTS.unearnedRevenue.name, side: "credit", amount: params.amount },
    ]);

    return { item: this.postJournal(draft) };
  }

  public recordCafeSale(params: {
    reference: string;
    amount: number;
    cogsAmount: number;
    inventoryAmount: number;
    description: string;
    occurredAt?: Date;
  }): Array<FinanceServiceResult<unknown>> {
    return [
      { item: this.postJournal(this.toBalancedJournal(`CF-${this.sequence++}`, params.description, params.reference, params.occurredAt ?? new Date(), [
        { accountCode: FINANCE_ACCOUNTS.cash.code, accountName: FINANCE_ACCOUNTS.cash.name, side: "debit", amount: params.amount },
        { accountCode: FINANCE_ACCOUNTS.sales.code, accountName: FINANCE_ACCOUNTS.sales.name, side: "credit", amount: params.amount },
      ])) },
      { item: this.postJournal(this.toBalancedJournal(`CF-COGS-${this.sequence++}`, `${params.description} - COGS`, params.reference, params.occurredAt ?? new Date(), [
        { accountCode: FINANCE_ACCOUNTS.cogs.code, accountName: FINANCE_ACCOUNTS.cogs.name, side: "debit", amount: params.cogsAmount },
        { accountCode: FINANCE_ACCOUNTS.inventory.code, accountName: FINANCE_ACCOUNTS.inventory.name, side: "credit", amount: params.inventoryAmount },
      ])) },
    ];
  }

  public recordSouvenirSale(params: {
    reference: string;
    amount: number;
    cogsAmount: number;
    inventoryAmount: number;
    description: string;
    occurredAt?: Date;
  }): Array<FinanceServiceResult<unknown>> {
    return this.recordCafeSale(params);
  }

  public recordInventoryPurchase(params: {
    reference: string;
    amount: number;
    description: string;
    occurredAt?: Date;
  }): FinanceServiceResult<unknown> {
    return {
      item: this.postJournal(this.toBalancedJournal(`PO-${this.sequence++}`, params.description, params.reference, params.occurredAt ?? new Date(), [
        { accountCode: FINANCE_ACCOUNTS.inventory.code, accountName: FINANCE_ACCOUNTS.inventory.name, side: "debit", amount: params.amount },
        { accountCode: FINANCE_ACCOUNTS.accountsPayable.code, accountName: FINANCE_ACCOUNTS.accountsPayable.name, side: "credit", amount: params.amount },
      ])),
    };
  }

  public snapshot() {
    return {
      cashAccounts: [...this.cashAccounts.values()],
      bankAccounts: [...this.bankAccounts.values()],
      cashTransactions: [...this.cashTransactions],
      bankTransactions: [...this.bankTransactions],
      expenses: [...this.expenses],
      incomes: [...this.incomes],
      transfers: [...this.transfers],
      pettyCashAccounts: [...this.pettyCashAccounts],
      cashMutations: [...this.cashMutations],
      dailyClosings: [...this.dailyClosings],
    };
  }

  private toBalancedJournal(
    entryNumber: string,
    description: string,
    reference: string,
    occurredAt: Date,
    lines: JournalEntryDraft["lines"],
  ): JournalEntryDraft {
    const totalDebit = lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amount, 0);
    const totalCredit = lines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amount, 0);

    if (totalDebit !== totalCredit) {
      throw new Error(`Journal entry ${entryNumber} is not balanced`);
    }

    return { entryNumber, description, reference, occurredAt, lines };
  }

  private postJournal(draft: JournalEntryDraft): JournalPostingResult<unknown> | undefined {
    return this.journalPort?.postJournalDraft(draft);
  }
}

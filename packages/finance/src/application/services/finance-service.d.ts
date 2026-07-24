import { BankAccount, BankTransaction, CashAccount, CashMutation, CashTransaction, DailyClosing, Expense, Income, PettyCash, Transfer, type FinanceTransactionDirection } from "../../domain/finance-domain";
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
export declare class FinanceService {
    private readonly dashboard;
    private readonly journalPort?;
    private readonly cashAccounts;
    private readonly bankAccounts;
    private readonly cashTransactions;
    private readonly bankTransactions;
    private readonly expenses;
    private readonly incomes;
    private readonly transfers;
    private readonly pettyCashAccounts;
    private readonly cashMutations;
    private readonly dailyClosings;
    private sequence;
    constructor(dashboard: WorkflowDashboardStore, journalPort?: JournalPostingPort<unknown> | undefined);
    createCashAccount(params: {
        code: string;
        name: string;
        openingBalance?: number;
        currency?: string;
    }): CashAccount;
    createBankAccount(params: {
        code: string;
        name: string;
        bankName: string;
        accountNumber: string;
        openingBalance?: number;
        currency?: string;
    }): BankAccount;
    recordCashTransaction(params: {
        accountCode: string;
        reference: string;
        amount: number;
        direction: FinanceTransactionDirection;
        description: string;
        occurredAt?: Date;
    }): FinanceServiceResult<CashTransaction>;
    recordBankTransaction(params: {
        accountCode: string;
        reference: string;
        amount: number;
        direction: FinanceTransactionDirection;
        description: string;
        occurredAt?: Date;
    }): FinanceServiceResult<BankTransaction>;
    recordExpense(params: {
        reference: string;
        category: string;
        amount: number;
        description: string;
        paidFromAccountCode?: string;
        occurredAt?: Date;
    }): FinanceServiceResult<Expense>;
    recordIncome(params: {
        reference: string;
        source: string;
        amount: number;
        description: string;
        receivedToAccountCode?: string;
        occurredAt?: Date;
    }): FinanceServiceResult<Income>;
    transferCash(params: {
        reference: string;
        fromAccountCode: string;
        toAccountCode: string;
        amount: number;
        fee?: number;
        description: string;
        direction?: "cash-to-bank" | "bank-to-cash" | "cash-to-cash" | "bank-to-bank";
        occurredAt?: Date;
    }): FinanceServiceResult<Transfer>;
    createPettyCash(params: {
        reference: string;
        holderName: string;
        cashAccountCode: string;
        openingBalance: number;
        limitAmount: number;
        openedAt?: Date;
    }): PettyCash;
    mutatePettyCash(params: {
        pettyCashReference: string;
        type: "top-up" | "usage" | "adjustment";
        amount: number;
        description: string;
        occurredAt?: Date;
    }): CashMutation;
    closeDailyCash(params: {
        closingDate: Date;
        openingCash: number;
        closingCash: number;
        expectedCash: number;
        notes?: string;
        approvedAt?: Date;
    }): DailyClosing;
    recordReservationPaid(params: {
        reference: string;
        amount: number;
        description: string;
        occurredAt?: Date;
    }): FinanceServiceResult<unknown>;
    recordCafeSale(params: {
        reference: string;
        amount: number;
        cogsAmount: number;
        inventoryAmount: number;
        description: string;
        occurredAt?: Date;
    }): Array<FinanceServiceResult<unknown>>;
    recordSouvenirSale(params: {
        reference: string;
        amount: number;
        cogsAmount: number;
        inventoryAmount: number;
        description: string;
        occurredAt?: Date;
    }): Array<FinanceServiceResult<unknown>>;
    recordInventoryPurchase(params: {
        reference: string;
        amount: number;
        description: string;
        occurredAt?: Date;
    }): FinanceServiceResult<unknown>;
    snapshot(): {
        cashAccounts: CashAccount[];
        bankAccounts: BankAccount[];
        cashTransactions: CashTransaction[];
        bankTransactions: BankTransaction[];
        expenses: Expense[];
        incomes: Income[];
        transfers: Transfer[];
        pettyCashAccounts: PettyCash[];
        cashMutations: CashMutation[];
        dailyClosings: DailyClosing[];
    };
    private toBalancedJournal;
    private postJournal;
}
export {};
//# sourceMappingURL=finance-service.d.ts.map
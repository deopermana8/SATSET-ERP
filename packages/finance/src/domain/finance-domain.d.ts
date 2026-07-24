declare abstract class Entity<T = string> {
    protected readonly _id: T;
    constructor(id: T);
    get id(): T;
    equals(entity?: Entity<T>): boolean;
}
declare abstract class AggregateRoot<T = string> extends Entity<T> {
    protected constructor(id: T);
}
export type FinanceAccountStatus = "active" | "inactive";
export type FinanceTransactionDirection = "inflow" | "outflow";
export type FinanceTransferDirection = "cash-to-bank" | "bank-to-cash" | "cash-to-cash" | "bank-to-bank";
export type FinanceMutationType = "top-up" | "usage" | "adjustment";
export type CashAccountProps = {
    code: string;
    name: string;
    openingBalance: number;
    currentBalance: number;
    currency: string;
    status: FinanceAccountStatus;
};
export declare class CashAccount extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: CashAccountProps);
    get code(): string;
    get name(): string;
    get openingBalance(): number;
    get currentBalance(): number;
    get currency(): string;
    get status(): FinanceAccountStatus;
}
export type BankAccountProps = {
    code: string;
    name: string;
    bankName: string;
    accountNumber: string;
    openingBalance: number;
    currentBalance: number;
    currency: string;
    status: FinanceAccountStatus;
};
export declare class BankAccount extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: BankAccountProps);
    get code(): string;
    get name(): string;
    get bankName(): string;
    get accountNumber(): string;
    get openingBalance(): number;
    get currentBalance(): number;
    get currency(): string;
    get status(): FinanceAccountStatus;
}
export type CashTransactionProps = {
    accountCode: string;
    reference: string;
    amount: number;
    direction: FinanceTransactionDirection;
    description: string;
    occurredAt: Date;
};
export declare class CashTransaction extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: CashTransactionProps);
    get accountCode(): string;
    get reference(): string;
    get amount(): number;
    get direction(): FinanceTransactionDirection;
    get description(): string;
    get occurredAt(): Date;
}
export type BankTransactionProps = {
    accountCode: string;
    reference: string;
    amount: number;
    direction: FinanceTransactionDirection;
    description: string;
    occurredAt: Date;
};
export declare class BankTransaction extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: BankTransactionProps);
    get accountCode(): string;
    get reference(): string;
    get amount(): number;
    get direction(): FinanceTransactionDirection;
    get description(): string;
    get occurredAt(): Date;
}
export type ExpenseProps = {
    reference: string;
    category: string;
    amount: number;
    description: string;
    paidFromAccountCode: string;
    occurredAt: Date;
};
export declare class Expense extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: ExpenseProps);
    get reference(): string;
    get category(): string;
    get amount(): number;
    get description(): string;
    get paidFromAccountCode(): string;
    get occurredAt(): Date;
}
export type IncomeProps = {
    reference: string;
    source: string;
    amount: number;
    description: string;
    receivedToAccountCode: string;
    occurredAt: Date;
};
export declare class Income extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: IncomeProps);
    get reference(): string;
    get source(): string;
    get amount(): number;
    get description(): string;
    get receivedToAccountCode(): string;
    get occurredAt(): Date;
}
export type TransferProps = {
    reference: string;
    fromAccountCode: string;
    toAccountCode: string;
    amount: number;
    fee: number;
    direction: FinanceTransferDirection;
    description: string;
    occurredAt: Date;
};
export declare class Transfer extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: TransferProps);
    get reference(): string;
    get fromAccountCode(): string;
    get toAccountCode(): string;
    get amount(): number;
    get fee(): number;
    get direction(): FinanceTransferDirection;
    get description(): string;
    get occurredAt(): Date;
}
export type PettyCashProps = {
    reference: string;
    holderName: string;
    cashAccountCode: string;
    openingBalance: number;
    currentBalance: number;
    limitAmount: number;
    openedAt: Date;
};
export declare class PettyCash extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: PettyCashProps);
    get reference(): string;
    get holderName(): string;
    get cashAccountCode(): string;
    get openingBalance(): number;
    get currentBalance(): number;
    get limitAmount(): number;
    get openedAt(): Date;
}
export type CashMutationProps = {
    pettyCashReference: string;
    type: FinanceMutationType;
    amount: number;
    description: string;
    occurredAt: Date;
};
export declare class CashMutation extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: CashMutationProps);
    get pettyCashReference(): string;
    get type(): FinanceMutationType;
    get amount(): number;
    get description(): string;
    get occurredAt(): Date;
}
export type DailyClosingProps = {
    closingDate: Date;
    openingCash: number;
    closingCash: number;
    expectedCash: number;
    variance: number;
    notes: string;
    approvedAt: Date;
};
export declare class DailyClosing extends AggregateRoot<string> {
    private readonly props;
    constructor(id: string, props: DailyClosingProps);
    get closingDate(): Date;
    get openingCash(): number;
    get closingCash(): number;
    get expectedCash(): number;
    get variance(): number;
    get notes(): string;
    get approvedAt(): Date;
}
export declare const FINANCE_ACCOUNTS: {
    readonly cash: {
        readonly code: "1010";
        readonly name: "Cash";
    };
    readonly bank: {
        readonly code: "1020";
        readonly name: "Bank";
    };
    readonly inventory: {
        readonly code: "1200";
        readonly name: "Inventory";
    };
    readonly accountsPayable: {
        readonly code: "2010";
        readonly name: "Accounts Payable";
    };
    readonly unearnedRevenue: {
        readonly code: "2200";
        readonly name: "Unearned Revenue";
    };
    readonly sales: {
        readonly code: "4000";
        readonly name: "Sales Revenue";
    };
    readonly cogs: {
        readonly code: "5000";
        readonly name: "Cost of Goods Sold";
    };
    readonly expense: {
        readonly code: "6000";
        readonly name: "Operating Expense";
    };
};
export {};
//# sourceMappingURL=finance-domain.d.ts.map
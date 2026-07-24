abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public get id(): T {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (entity.constructor !== this.constructor) {
      return false;
    }

    return this._id === entity._id;
  }
}

abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
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

export class CashAccount extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CashAccountProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Cash account code is required");
    if (!props.name.trim()) throw new Error("Cash account name is required");
    if (props.currentBalance < 0) throw new Error("Cash account balance cannot be negative");
  }

  public get code(): string { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get openingBalance(): number { return this.props.openingBalance; }
  public get currentBalance(): number { return this.props.currentBalance; }
  public get currency(): string { return this.props.currency; }
  public get status(): FinanceAccountStatus { return this.props.status; }
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

export class BankAccount extends AggregateRoot<string> {
  constructor(id: string, private readonly props: BankAccountProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Bank account code is required");
    if (!props.name.trim()) throw new Error("Bank account name is required");
    if (!props.bankName.trim()) throw new Error("Bank name is required");
    if (!props.accountNumber.trim()) throw new Error("Account number is required");
    if (props.currentBalance < 0) throw new Error("Bank account balance cannot be negative");
  }

  public get code(): string { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get bankName(): string { return this.props.bankName; }
  public get accountNumber(): string { return this.props.accountNumber; }
  public get openingBalance(): number { return this.props.openingBalance; }
  public get currentBalance(): number { return this.props.currentBalance; }
  public get currency(): string { return this.props.currency; }
  public get status(): FinanceAccountStatus { return this.props.status; }
}

export type CashTransactionProps = {
  accountCode: string;
  reference: string;
  amount: number;
  direction: FinanceTransactionDirection;
  description: string;
  occurredAt: Date;
};

export class CashTransaction extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CashTransactionProps) {
    super(id);
    if (!props.accountCode.trim()) throw new Error("Cash account code is required");
    if (!props.reference.trim()) throw new Error("Cash transaction reference is required");
    if (props.amount <= 0) throw new Error("Cash transaction amount must be positive");
  }

  public get accountCode(): string { return this.props.accountCode; }
  public get reference(): string { return this.props.reference; }
  public get amount(): number { return this.props.amount; }
  public get direction(): FinanceTransactionDirection { return this.props.direction; }
  public get description(): string { return this.props.description; }
  public get occurredAt(): Date { return this.props.occurredAt; }
}

export type BankTransactionProps = {
  accountCode: string;
  reference: string;
  amount: number;
  direction: FinanceTransactionDirection;
  description: string;
  occurredAt: Date;
};

export class BankTransaction extends AggregateRoot<string> {
  constructor(id: string, private readonly props: BankTransactionProps) {
    super(id);
    if (!props.accountCode.trim()) throw new Error("Bank account code is required");
    if (!props.reference.trim()) throw new Error("Bank transaction reference is required");
    if (props.amount <= 0) throw new Error("Bank transaction amount must be positive");
  }

  public get accountCode(): string { return this.props.accountCode; }
  public get reference(): string { return this.props.reference; }
  public get amount(): number { return this.props.amount; }
  public get direction(): FinanceTransactionDirection { return this.props.direction; }
  public get description(): string { return this.props.description; }
  public get occurredAt(): Date { return this.props.occurredAt; }
}

export type ExpenseProps = {
  reference: string;
  category: string;
  amount: number;
  description: string;
  paidFromAccountCode: string;
  occurredAt: Date;
};

export class Expense extends AggregateRoot<string> {
  constructor(id: string, private readonly props: ExpenseProps) {
    super(id);
    if (!props.reference.trim()) throw new Error("Expense reference is required");
    if (!props.category.trim()) throw new Error("Expense category is required");
    if (props.amount <= 0) throw new Error("Expense amount must be positive");
    if (!props.paidFromAccountCode.trim()) throw new Error("Expense cash account is required");
  }

  public get reference(): string { return this.props.reference; }
  public get category(): string { return this.props.category; }
  public get amount(): number { return this.props.amount; }
  public get description(): string { return this.props.description; }
  public get paidFromAccountCode(): string { return this.props.paidFromAccountCode; }
  public get occurredAt(): Date { return this.props.occurredAt; }
}

export type IncomeProps = {
  reference: string;
  source: string;
  amount: number;
  description: string;
  receivedToAccountCode: string;
  occurredAt: Date;
};

export class Income extends AggregateRoot<string> {
  constructor(id: string, private readonly props: IncomeProps) {
    super(id);
    if (!props.reference.trim()) throw new Error("Income reference is required");
    if (!props.source.trim()) throw new Error("Income source is required");
    if (props.amount <= 0) throw new Error("Income amount must be positive");
    if (!props.receivedToAccountCode.trim()) throw new Error("Income cash account is required");
  }

  public get reference(): string { return this.props.reference; }
  public get source(): string { return this.props.source; }
  public get amount(): number { return this.props.amount; }
  public get description(): string { return this.props.description; }
  public get receivedToAccountCode(): string { return this.props.receivedToAccountCode; }
  public get occurredAt(): Date { return this.props.occurredAt; }
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

export class Transfer extends AggregateRoot<string> {
  constructor(id: string, private readonly props: TransferProps) {
    super(id);
    if (!props.reference.trim()) throw new Error("Transfer reference is required");
    if (!props.fromAccountCode.trim()) throw new Error("Transfer source account is required");
    if (!props.toAccountCode.trim()) throw new Error("Transfer destination account is required");
    if (props.amount <= 0) throw new Error("Transfer amount must be positive");
    if (props.fee < 0) throw new Error("Transfer fee cannot be negative");
  }

  public get reference(): string { return this.props.reference; }
  public get fromAccountCode(): string { return this.props.fromAccountCode; }
  public get toAccountCode(): string { return this.props.toAccountCode; }
  public get amount(): number { return this.props.amount; }
  public get fee(): number { return this.props.fee; }
  public get direction(): FinanceTransferDirection { return this.props.direction; }
  public get description(): string { return this.props.description; }
  public get occurredAt(): Date { return this.props.occurredAt; }
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

export class PettyCash extends AggregateRoot<string> {
  constructor(id: string, private readonly props: PettyCashProps) {
    super(id);
    if (!props.reference.trim()) throw new Error("Petty cash reference is required");
    if (!props.holderName.trim()) throw new Error("Petty cash holder is required");
    if (!props.cashAccountCode.trim()) throw new Error("Petty cash cash account is required");
    if (props.openingBalance < 0) throw new Error("Opening balance cannot be negative");
    if (props.currentBalance < 0) throw new Error("Current balance cannot be negative");
    if (props.limitAmount <= 0) throw new Error("Limit amount must be positive");
  }

  public get reference(): string { return this.props.reference; }
  public get holderName(): string { return this.props.holderName; }
  public get cashAccountCode(): string { return this.props.cashAccountCode; }
  public get openingBalance(): number { return this.props.openingBalance; }
  public get currentBalance(): number { return this.props.currentBalance; }
  public get limitAmount(): number { return this.props.limitAmount; }
  public get openedAt(): Date { return this.props.openedAt; }
}

export type CashMutationProps = {
  pettyCashReference: string;
  type: FinanceMutationType;
  amount: number;
  description: string;
  occurredAt: Date;
};

export class CashMutation extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CashMutationProps) {
    super(id);
    if (!props.pettyCashReference.trim()) throw new Error("Petty cash reference is required");
    if (props.amount <= 0) throw new Error("Mutation amount must be positive");
  }

  public get pettyCashReference(): string { return this.props.pettyCashReference; }
  public get type(): FinanceMutationType { return this.props.type; }
  public get amount(): number { return this.props.amount; }
  public get description(): string { return this.props.description; }
  public get occurredAt(): Date { return this.props.occurredAt; }
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

export class DailyClosing extends AggregateRoot<string> {
  constructor(id: string, private readonly props: DailyClosingProps) {
    super(id);
    if (props.openingCash < 0) throw new Error("Opening cash cannot be negative");
  }

  public get closingDate(): Date { return this.props.closingDate; }
  public get openingCash(): number { return this.props.openingCash; }
  public get closingCash(): number { return this.props.closingCash; }
  public get expectedCash(): number { return this.props.expectedCash; }
  public get variance(): number { return this.props.variance; }
  public get notes(): string { return this.props.notes; }
  public get approvedAt(): Date { return this.props.approvedAt; }
}

export const FINANCE_ACCOUNTS = {
  cash: { code: "1010", name: "Cash" },
  bank: { code: "1020", name: "Bank" },
  inventory: { code: "1200", name: "Inventory" },
  accountsPayable: { code: "2010", name: "Accounts Payable" },
  unearnedRevenue: { code: "2200", name: "Unearned Revenue" },
  sales: { code: "4000", name: "Sales Revenue" },
  cogs: { code: "5000", name: "Cost of Goods Sold" },
  expense: { code: "6000", name: "Operating Expense" },
} as const;
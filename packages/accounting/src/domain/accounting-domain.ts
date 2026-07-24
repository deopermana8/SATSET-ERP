import { AggregateRoot } from "@satset/shared";

export type AccountCategory = "asset" | "liability" | "equity" | "revenue" | "expense";
export type NormalBalance = "debit" | "credit";
export type ReportSection = "operating" | "investing" | "financing";
export type PeriodStatus = "open" | "closed";

export type ChartOfAccountProps = {
  code: string;
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  parentCode?: string;
  openingBalance?: number;
  isActive?: boolean;
};

export class ChartOfAccount extends AggregateRoot<string> {
  constructor(id: string, private readonly props: ChartOfAccountProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Account code is required");
    if (!props.name.trim()) throw new Error("Account name is required");
  }

  public get code(): string { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get category(): AccountCategory { return this.props.category; }
  public get normalBalance(): NormalBalance { return this.props.normalBalance; }
  public get parentCode(): string | undefined { return this.props.parentCode; }
  public get openingBalance(): number { return this.props.openingBalance ?? 0; }
  public get isActive(): boolean { return this.props.isActive ?? true; }
}

export type JournalSide = "debit" | "credit";

export type JournalLineProps = {
  accountCode: string;
  accountName: string;
  side: JournalSide;
  amount: number;
  memo?: string;
};

export class JournalLine extends AggregateRoot<string> {
  constructor(id: string, private readonly props: JournalLineProps) {
    super(id);
    if (!props.accountCode.trim()) throw new Error("Journal line account code is required");
    if (!props.accountName.trim()) throw new Error("Journal line account name is required");
    if (props.amount <= 0) throw new Error("Journal line amount must be positive");
  }

  public get accountCode(): string { return this.props.accountCode; }
  public get accountName(): string { return this.props.accountName; }
  public get side(): JournalSide { return this.props.side; }
  public get amount(): number { return this.props.amount; }
  public get memo(): string | undefined { return this.props.memo; }
}

export type JournalEntryProps = {
  entryNumber: string;
  description: string;
  reference?: string;
  occurredAt: Date;
  lines: Array<JournalLine>;
};

export class JournalEntry extends AggregateRoot<string> {
  constructor(id: string, private readonly props: JournalEntryProps) {
    super(id);
    this.validate();
  }

  private validate(): void {
    if (!this.props.entryNumber.trim()) throw new Error("Journal entry number is required");
    if (!this.props.description.trim()) throw new Error("Journal entry description is required");
    if (this.props.lines.length < 2) throw new Error("Journal entry must contain at least two lines");

    const totalDebit = this.props.lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amount, 0);
    const totalCredit = this.props.lines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amount, 0);

    if (totalDebit !== totalCredit) throw new Error("Journal entry must be balanced");
  }

  public get entryNumber(): string { return this.props.entryNumber; }
  public get description(): string { return this.props.description; }
  public get reference(): string | undefined { return this.props.reference; }
  public get occurredAt(): Date { return this.props.occurredAt; }
  public get lines(): Array<JournalLine> { return [...this.props.lines]; }
  public get totalDebit(): number { return this.lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amount, 0); }
  public get totalCredit(): number { return this.lines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amount, 0); }
}

export type LedgerProps = {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
};

export class Ledger extends AggregateRoot<string> {
  constructor(id: string, private readonly props: LedgerProps) {
    super(id);
  }

  public get accountCode(): string { return this.props.accountCode; }
  public get accountName(): string { return this.props.accountName; }
  public get category(): AccountCategory { return this.props.category; }
  public get normalBalance(): NormalBalance { return this.props.normalBalance; }
  public get openingBalance(): number { return this.props.openingBalance; }
  public get debitTotal(): number { return this.props.debitTotal; }
  public get creditTotal(): number { return this.props.creditTotal; }
  public get closingBalance(): number { return this.props.closingBalance; }
}

export type TrialBalanceProps = {
  ledgers: Array<Ledger>;
  totalDebit: number;
  totalCredit: number;
};

export class TrialBalance extends AggregateRoot<string> {
  constructor(id: string, private readonly props: TrialBalanceProps) {
    super(id);
  }

  public get ledgers(): Array<Ledger> { return [...this.props.ledgers]; }
  public get totalDebit(): number { return this.props.totalDebit; }
  public get totalCredit(): number { return this.props.totalCredit; }
}

export type BalanceSheetProps = {
  assets: Array<Ledger>;
  liabilities: Array<Ledger>;
  equity: Array<Ledger>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
};

export class BalanceSheet extends AggregateRoot<string> {
  constructor(id: string, private readonly props: BalanceSheetProps) {
    super(id);
  }

  public get assets(): Array<Ledger> { return [...this.props.assets]; }
  public get liabilities(): Array<Ledger> { return [...this.props.liabilities]; }
  public get equity(): Array<Ledger> { return [...this.props.equity]; }
  public get totalAssets(): number { return this.props.totalAssets; }
  public get totalLiabilities(): number { return this.props.totalLiabilities; }
  public get totalEquity(): number { return this.props.totalEquity; }
}

export type IncomeStatementProps = {
  revenues: Array<Ledger>;
  expenses: Array<Ledger>;
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
};

export class IncomeStatement extends AggregateRoot<string> {
  constructor(id: string, private readonly props: IncomeStatementProps) {
    super(id);
  }

  public get revenues(): Array<Ledger> { return [...this.props.revenues]; }
  public get expenses(): Array<Ledger> { return [...this.props.expenses]; }
  public get totalRevenue(): number { return this.props.totalRevenue; }
  public get totalExpense(): number { return this.props.totalExpense; }
  public get netIncome(): number { return this.props.netIncome; }
}

export type CashFlowProps = {
  operating: number;
  investing: number;
  financing: number;
  netChangeInCash: number;
};

export class CashFlow extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CashFlowProps) {
    super(id);
  }

  public get operating(): number { return this.props.operating; }
  public get investing(): number { return this.props.investing; }
  public get financing(): number { return this.props.financing; }
  public get netChangeInCash(): number { return this.props.netChangeInCash; }
}

export type FiscalPeriodProps = {
  name: string;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
};

export class FiscalPeriod extends AggregateRoot<string> {
  constructor(id: string, private readonly props: FiscalPeriodProps) {
    super(id);
    if (!props.name.trim()) throw new Error("Fiscal period name is required");
    if (props.endDate < props.startDate) throw new Error("Fiscal period end date must be after start date");
  }

  public get name(): string { return this.props.name; }
  public get startDate(): Date { return this.props.startDate; }
  public get endDate(): Date { return this.props.endDate; }
  public get status(): PeriodStatus { return this.props.status; }
}

export type ClosingPeriodProps = {
  fiscalPeriodId: string;
  closingJournalEntryNumber: string;
  closedAt: Date;
  retainedEarnings: number;
};

export class ClosingPeriod extends AggregateRoot<string> {
  constructor(id: string, private readonly props: ClosingPeriodProps) {
    super(id);
    if (!props.fiscalPeriodId.trim()) throw new Error("Fiscal period id is required");
    if (!props.closingJournalEntryNumber.trim()) throw new Error("Closing journal entry number is required");
  }

  public get fiscalPeriodId(): string { return this.props.fiscalPeriodId; }
  public get closingJournalEntryNumber(): string { return this.props.closingJournalEntryNumber; }
  public get closedAt(): Date { return this.props.closedAt; }
  public get retainedEarnings(): number { return this.props.retainedEarnings; }
}

export const STANDARD_CHART_OF_ACCOUNTS: Array<ChartOfAccountProps> = [
  { code: "1010", name: "Cash", category: "asset", normalBalance: "debit" },
  { code: "1020", name: "Bank", category: "asset", normalBalance: "debit" },
  { code: "1200", name: "Inventory", category: "asset", normalBalance: "debit" },
  { code: "2010", name: "Accounts Payable", category: "liability", normalBalance: "credit" },
  { code: "2200", name: "Unearned Revenue", category: "liability", normalBalance: "credit" },
  { code: "3000", name: "Retained Earnings", category: "equity", normalBalance: "credit" },
  { code: "4000", name: "Sales Revenue", category: "revenue", normalBalance: "credit" },
  { code: "5000", name: "Cost of Goods Sold", category: "expense", normalBalance: "debit" },
  { code: "6000", name: "Operating Expense", category: "expense", normalBalance: "debit" },
];
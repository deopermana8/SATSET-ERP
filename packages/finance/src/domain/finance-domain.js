class Entity {
    constructor(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    equals(entity) {
        if (entity === null || entity === undefined) {
            return false;
        }
        if (entity.constructor !== this.constructor) {
            return false;
        }
        return this._id === entity._id;
    }
}
class AggregateRoot extends Entity {
    constructor(id) {
        super(id);
    }
}
export class CashAccount extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.code.trim())
            throw new Error("Cash account code is required");
        if (!props.name.trim())
            throw new Error("Cash account name is required");
        if (props.currentBalance < 0)
            throw new Error("Cash account balance cannot be negative");
    }
    get code() { return this.props.code; }
    get name() { return this.props.name; }
    get openingBalance() { return this.props.openingBalance; }
    get currentBalance() { return this.props.currentBalance; }
    get currency() { return this.props.currency; }
    get status() { return this.props.status; }
}
export class BankAccount extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.code.trim())
            throw new Error("Bank account code is required");
        if (!props.name.trim())
            throw new Error("Bank account name is required");
        if (!props.bankName.trim())
            throw new Error("Bank name is required");
        if (!props.accountNumber.trim())
            throw new Error("Account number is required");
        if (props.currentBalance < 0)
            throw new Error("Bank account balance cannot be negative");
    }
    get code() { return this.props.code; }
    get name() { return this.props.name; }
    get bankName() { return this.props.bankName; }
    get accountNumber() { return this.props.accountNumber; }
    get openingBalance() { return this.props.openingBalance; }
    get currentBalance() { return this.props.currentBalance; }
    get currency() { return this.props.currency; }
    get status() { return this.props.status; }
}
export class CashTransaction extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.accountCode.trim())
            throw new Error("Cash account code is required");
        if (!props.reference.trim())
            throw new Error("Cash transaction reference is required");
        if (props.amount <= 0)
            throw new Error("Cash transaction amount must be positive");
    }
    get accountCode() { return this.props.accountCode; }
    get reference() { return this.props.reference; }
    get amount() { return this.props.amount; }
    get direction() { return this.props.direction; }
    get description() { return this.props.description; }
    get occurredAt() { return this.props.occurredAt; }
}
export class BankTransaction extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.accountCode.trim())
            throw new Error("Bank account code is required");
        if (!props.reference.trim())
            throw new Error("Bank transaction reference is required");
        if (props.amount <= 0)
            throw new Error("Bank transaction amount must be positive");
    }
    get accountCode() { return this.props.accountCode; }
    get reference() { return this.props.reference; }
    get amount() { return this.props.amount; }
    get direction() { return this.props.direction; }
    get description() { return this.props.description; }
    get occurredAt() { return this.props.occurredAt; }
}
export class Expense extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.reference.trim())
            throw new Error("Expense reference is required");
        if (!props.category.trim())
            throw new Error("Expense category is required");
        if (props.amount <= 0)
            throw new Error("Expense amount must be positive");
        if (!props.paidFromAccountCode.trim())
            throw new Error("Expense cash account is required");
    }
    get reference() { return this.props.reference; }
    get category() { return this.props.category; }
    get amount() { return this.props.amount; }
    get description() { return this.props.description; }
    get paidFromAccountCode() { return this.props.paidFromAccountCode; }
    get occurredAt() { return this.props.occurredAt; }
}
export class Income extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.reference.trim())
            throw new Error("Income reference is required");
        if (!props.source.trim())
            throw new Error("Income source is required");
        if (props.amount <= 0)
            throw new Error("Income amount must be positive");
        if (!props.receivedToAccountCode.trim())
            throw new Error("Income cash account is required");
    }
    get reference() { return this.props.reference; }
    get source() { return this.props.source; }
    get amount() { return this.props.amount; }
    get description() { return this.props.description; }
    get receivedToAccountCode() { return this.props.receivedToAccountCode; }
    get occurredAt() { return this.props.occurredAt; }
}
export class Transfer extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.reference.trim())
            throw new Error("Transfer reference is required");
        if (!props.fromAccountCode.trim())
            throw new Error("Transfer source account is required");
        if (!props.toAccountCode.trim())
            throw new Error("Transfer destination account is required");
        if (props.amount <= 0)
            throw new Error("Transfer amount must be positive");
        if (props.fee < 0)
            throw new Error("Transfer fee cannot be negative");
    }
    get reference() { return this.props.reference; }
    get fromAccountCode() { return this.props.fromAccountCode; }
    get toAccountCode() { return this.props.toAccountCode; }
    get amount() { return this.props.amount; }
    get fee() { return this.props.fee; }
    get direction() { return this.props.direction; }
    get description() { return this.props.description; }
    get occurredAt() { return this.props.occurredAt; }
}
export class PettyCash extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.reference.trim())
            throw new Error("Petty cash reference is required");
        if (!props.holderName.trim())
            throw new Error("Petty cash holder is required");
        if (!props.cashAccountCode.trim())
            throw new Error("Petty cash cash account is required");
        if (props.openingBalance < 0)
            throw new Error("Opening balance cannot be negative");
        if (props.currentBalance < 0)
            throw new Error("Current balance cannot be negative");
        if (props.limitAmount <= 0)
            throw new Error("Limit amount must be positive");
    }
    get reference() { return this.props.reference; }
    get holderName() { return this.props.holderName; }
    get cashAccountCode() { return this.props.cashAccountCode; }
    get openingBalance() { return this.props.openingBalance; }
    get currentBalance() { return this.props.currentBalance; }
    get limitAmount() { return this.props.limitAmount; }
    get openedAt() { return this.props.openedAt; }
}
export class CashMutation extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (!props.pettyCashReference.trim())
            throw new Error("Petty cash reference is required");
        if (props.amount <= 0)
            throw new Error("Mutation amount must be positive");
    }
    get pettyCashReference() { return this.props.pettyCashReference; }
    get type() { return this.props.type; }
    get amount() { return this.props.amount; }
    get description() { return this.props.description; }
    get occurredAt() { return this.props.occurredAt; }
}
export class DailyClosing extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        if (props.openingCash < 0)
            throw new Error("Opening cash cannot be negative");
    }
    get closingDate() { return this.props.closingDate; }
    get openingCash() { return this.props.openingCash; }
    get closingCash() { return this.props.closingCash; }
    get expectedCash() { return this.props.expectedCash; }
    get variance() { return this.props.variance; }
    get notes() { return this.props.notes; }
    get approvedAt() { return this.props.approvedAt; }
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
};

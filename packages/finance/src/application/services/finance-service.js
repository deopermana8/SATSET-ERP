import { FINANCE_ACCOUNTS, BankAccount, BankTransaction, CashAccount, CashMutation, CashTransaction, DailyClosing, Expense, Income, PettyCash, Transfer, } from "../../domain/finance-domain";
export class FinanceService {
    constructor(dashboard, journalPort) {
        this.dashboard = dashboard;
        this.journalPort = journalPort;
        this.cashAccounts = new Map();
        this.bankAccounts = new Map();
        this.cashTransactions = [];
        this.bankTransactions = [];
        this.expenses = [];
        this.incomes = [];
        this.transfers = [];
        this.pettyCashAccounts = [];
        this.cashMutations = [];
        this.dailyClosings = [];
        this.sequence = 1;
    }
    createCashAccount(params) {
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
    createBankAccount(params) {
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
    recordCashTransaction(params) {
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
    recordBankTransaction(params) {
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
    recordExpense(params) {
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
    recordIncome(params) {
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
    transferCash(params) {
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
    createPettyCash(params) {
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
    mutatePettyCash(params) {
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
    closeDailyCash(params) {
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
    recordReservationPaid(params) {
        const draft = this.toBalancedJournal(`RV-${this.sequence++}`, params.description, params.reference, params.occurredAt ?? new Date(), [
            { accountCode: FINANCE_ACCOUNTS.cash.code, accountName: FINANCE_ACCOUNTS.cash.name, side: "debit", amount: params.amount },
            { accountCode: FINANCE_ACCOUNTS.unearnedRevenue.code, accountName: FINANCE_ACCOUNTS.unearnedRevenue.name, side: "credit", amount: params.amount },
        ]);
        return { item: this.postJournal(draft) };
    }
    recordCafeSale(params) {
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
    recordSouvenirSale(params) {
        return this.recordCafeSale(params);
    }
    recordInventoryPurchase(params) {
        return {
            item: this.postJournal(this.toBalancedJournal(`PO-${this.sequence++}`, params.description, params.reference, params.occurredAt ?? new Date(), [
                { accountCode: FINANCE_ACCOUNTS.inventory.code, accountName: FINANCE_ACCOUNTS.inventory.name, side: "debit", amount: params.amount },
                { accountCode: FINANCE_ACCOUNTS.accountsPayable.code, accountName: FINANCE_ACCOUNTS.accountsPayable.name, side: "credit", amount: params.amount },
            ])),
        };
    }
    snapshot() {
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
    toBalancedJournal(entryNumber, description, reference, occurredAt, lines) {
        const totalDebit = lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amount, 0);
        const totalCredit = lines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amount, 0);
        if (totalDebit !== totalCredit) {
            throw new Error(`Journal entry ${entryNumber} is not balanced`);
        }
        return { entryNumber, description, reference, occurredAt, lines };
    }
    postJournal(draft) {
        return this.journalPort?.postJournalDraft(draft);
    }
}

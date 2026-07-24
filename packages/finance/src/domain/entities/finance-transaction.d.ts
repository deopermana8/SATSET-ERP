declare abstract class Entity<T = string> {
    protected readonly _id: T;
    constructor(id: T);
    get id(): T;
    equals(entity?: Entity<T>): boolean;
}
declare abstract class AggregateRoot<T = string> extends Entity<T> {
    protected constructor(id: T);
}
export type FinanceTransactionProps = {
    reference: string;
    amount: number;
    type: "cash" | "card" | "sale" | "expense";
    description: string;
    occurredAt: Date;
};
export declare class FinanceTransaction extends AggregateRoot<string> {
    private props;
    constructor(id: string, props: FinanceTransactionProps);
    private validate;
    get reference(): string;
    get amount(): number;
    get type(): string;
    get description(): string;
    get occurredAt(): Date;
}
export {};
//# sourceMappingURL=finance-transaction.d.ts.map
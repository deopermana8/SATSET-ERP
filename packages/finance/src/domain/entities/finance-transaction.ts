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

export type FinanceTransactionProps = {
  reference: string;
  amount: number;
  type: "cash" | "card" | "sale" | "expense";
  description: string;
  occurredAt: Date;
};

export class FinanceTransaction extends AggregateRoot<string> {
  private props: FinanceTransactionProps;

  constructor(id: string, props: FinanceTransactionProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.reference?.trim()) throw new Error("Reference is required");
    if (this.props.amount <= 0) throw new Error("Amount must be positive");
  }

  public get reference(): string {
    return this.props.reference;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get type(): string {
    return this.props.type;
  }

  public get description(): string {
    return this.props.description;
  }

  public get occurredAt(): Date {
    return this.props.occurredAt;
  }
}

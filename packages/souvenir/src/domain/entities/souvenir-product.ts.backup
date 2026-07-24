import { AggregateRoot } from "@satset/shared";

export type SouvenirProductProps = {
  code: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
};

export class SouvenirProduct extends AggregateRoot<string> {
  private props: SouvenirProductProps;

  constructor(id: string, props: SouvenirProductProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.code?.trim()) throw new Error("Product code is required");
    if (!this.props.name?.trim()) throw new Error("Product name is required");
    if (this.props.price < 0) throw new Error("Price cannot be negative");
    if (this.props.cost < 0) throw new Error("Cost cannot be negative");
    if (this.props.stock < 0) throw new Error("Stock cannot be negative");
  }

  public get code(): string {
    return this.props.code;
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get price(): number {
    return this.props.price;
  }

  public get cost(): number {
    return this.props.cost;
  }

  public get category(): string {
    return this.props.category;
  }

  public get stock(): number {
    return this.props.stock;
  }

  public get margin(): number {
    return this.props.price - this.props.cost;
  }

  public get marginPercent(): number {
    return this.props.price > 0 ? (this.margin / this.props.price) * 100 : 0;
  }

  public canSell(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  public sell(quantity: number): void {
    if (!this.canSell(quantity)) {
      throw new Error(`Insufficient stock. Available: ${this.props.stock}`);
    }
    this.props.stock -= quantity;
  }

  public restock(quantity: number): void {
    this.props.stock += quantity;
  }
}

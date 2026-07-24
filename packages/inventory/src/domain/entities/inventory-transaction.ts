import { AggregateRoot } from "@satset/shared";

export type InventoryTransactionProps = {
  transactionType: "stock-in" | "stock-out" | "adjustment";
  itemSku: string;
  itemName: string;
  quantity: number;
  reference: string;
  notes: string;
  createdAt: Date;
  createdBy: string;
};

export class InventoryTransaction extends AggregateRoot<string> {
  private props: InventoryTransactionProps;

  constructor(id: string, props: InventoryTransactionProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!["stock-in", "stock-out", "adjustment"].includes(this.props.transactionType)) {
      throw new Error("Invalid transaction type");
    }
    if (!this.props.itemSku?.trim()) throw new Error("Item SKU is required");
    if (this.props.quantity === 0) throw new Error("Quantity cannot be zero");
    if (!this.props.reference?.trim()) throw new Error("Reference is required");
  }

  public static create(params: {
    id: string;
    transactionType: "stock-in" | "stock-out" | "adjustment";
    itemSku: string;
    itemName: string;
    quantity: number;
    reference: string;
    notes?: string;
    createdBy?: string;
  }): InventoryTransaction {
    return new InventoryTransaction(params.id, {
      transactionType: params.transactionType,
      itemSku: params.itemSku,
      itemName: params.itemName,
      quantity: params.quantity,
      reference: params.reference,
      notes: params.notes || "",
      createdAt: new Date(),
      createdBy: params.createdBy || "System",
    });
  }

  public get transactionType(): string {
    return this.props.transactionType;
  }

  public get itemSku(): string {
    return this.props.itemSku;
  }

  public get itemName(): string {
    return this.props.itemName;
  }

  public get quantity(): number {
    return this.props.quantity;
  }

  public get reference(): string {
    return this.props.reference;
  }

  public get notes(): string {
    return this.props.notes;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get createdBy(): string {
    return this.props.createdBy;
  }
}

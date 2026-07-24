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

export type OrderLineItem = {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
};

export type CafeOrderProps = {
  orderNumber: string;
  lineItems: OrderLineItem[];
  totalAmount: number;
  status: "draft" | "confirmed" | "completed" | "cancelled";
  tableNumber?: string;
  customerName?: string;
  createdAt: Date;
  completedAt?: Date;
};

export class CafeOrder extends AggregateRoot<string> {
  private props: CafeOrderProps;

  constructor(id: string, props: CafeOrderProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.orderNumber?.trim()) throw new Error("Order number is required");
    if (this.props.lineItems.length === 0) throw new Error("Order must have at least one item");
    if (this.props.totalAmount < 0) throw new Error("Total amount cannot be negative");
  }

  public static create(params: {
    id: string;
    orderNumber: string;
    tableNumber?: string;
    customerName?: string;
  }): CafeOrder {
    return new CafeOrder(params.id, {
      orderNumber: params.orderNumber,
      lineItems: [],
      totalAmount: 0,
      status: "draft",
      tableNumber: params.tableNumber,
      customerName: params.customerName,
      createdAt: new Date(),
    });
  }

  public get orderNumber(): string {
    return this.props.orderNumber;
  }

  public get lineItems(): OrderLineItem[] {
    return this.props.lineItems;
  }

  public get totalAmount(): number {
    return this.props.totalAmount;
  }

  public get status(): string {
    return this.props.status;
  }

  public get tableNumber(): string | undefined {
    return this.props.tableNumber;
  }

  public get customerName(): string | undefined {
    return this.props.customerName;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public addItem(item: OrderLineItem): void {
    if (this.props.status !== "draft") {
      throw new Error("Cannot add items to non-draft order");
    }

    const existingItem = this.props.lineItems.find((li) => li.menuItemId === item.menuItemId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      this.props.lineItems.push(item);
    }

    this.recalculateTotal();
  }

  public removeItem(menuItemId: string): void {
    if (this.props.status !== "draft") {
      throw new Error("Cannot remove items from non-draft order");
    }

    this.props.lineItems = this.props.lineItems.filter((li) => li.menuItemId !== menuItemId);
    this.recalculateTotal();
  }

  public updateItemQuantity(menuItemId: string, quantity: number): void {
    if (this.props.status !== "draft") {
      throw new Error("Cannot update non-draft order");
    }

    const item = this.props.lineItems.find((li) => li.menuItemId === menuItemId);
    if (!item) throw new Error("Item not found in order");

    item.quantity = Math.max(1, quantity);
    item.subtotal = item.quantity * item.unitPrice;
    this.recalculateTotal();
  }

  public confirm(): void {
    if (this.props.status !== "draft") {
      throw new Error("Only draft orders can be confirmed");
    }

    this.props.status = "confirmed";
  }

  public complete(): void {
    if (this.props.status !== "confirmed") {
      throw new Error("Only confirmed orders can be completed");
    }

    this.props.status = "completed";
    this.props.completedAt = new Date();
  }

  public cancel(): void {
    if (["completed", "cancelled"].includes(this.props.status)) {
      throw new Error("Cannot cancel completed or already cancelled order");
    }

    this.props.status = "cancelled";
  }

  private recalculateTotal(): void {
    this.props.totalAmount = this.props.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  }
}

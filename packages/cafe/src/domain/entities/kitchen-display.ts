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

export type KitchenOrderItem = {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  specialNotes: string;
  prepTime: number;
  status: "pending" | "cooking" | "ready" | "served";
};

export type KitchenDisplayProps = {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  items: KitchenOrderItem[];
  orderTime: Date;
  startCookingTime?: Date;
  completedTime?: Date;
  priority: "normal" | "urgent";
};

export class KitchenDisplay extends AggregateRoot<string> {
  private props: KitchenDisplayProps;

  constructor(id: string, props: KitchenDisplayProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.orderId?.trim()) throw new Error("Order ID is required");
    if (this.props.items.length === 0) throw new Error("Order must have items");
  }

  public static create(params: {
    id: string;
    orderId: string;
    orderNumber: string;
    tableNumber: string;
    priority?: "normal" | "urgent";
  }): KitchenDisplay {
    return new KitchenDisplay(params.id, {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      tableNumber: params.tableNumber,
      items: [],
      orderTime: new Date(),
      priority: params.priority || "normal",
    });
  }

  public get orderId(): string {
    return this.props.orderId;
  }

  public get orderNumber(): string {
    return this.props.orderNumber;
  }

  public get tableNumber(): string {
    return this.props.tableNumber;
  }

  public get items(): KitchenOrderItem[] {
    return this.props.items;
  }

  public get orderTime(): Date {
    return this.props.orderTime;
  }

  public get priority(): string {
    return this.props.priority;
  }

  public get status(): string {
    if (this.props.items.length === 0) return "empty";
    const allReady = this.props.items.every((item) => item.status === "ready");
    const anyServed = this.props.items.some((item) => item.status === "served");
    if (anyServed) return "served";
    if (allReady) return "ready";
    const anyCooking = this.props.items.some((item) => item.status === "cooking");
    return anyCooking ? "cooking" : "pending";
  }

  public get estimatedTime(): number {
    return Math.max(...this.props.items.map((item) => item.prepTime), 0);
  }

  public addItem(item: KitchenOrderItem): void {
    this.props.items.push(item);
  }

  public startCooking(): void {
    this.props.startCookingTime = new Date();
    this.props.items.forEach((item) => {
      if (item.status === "pending") {
        item.status = "cooking";
      }
    });
  }

  public markItemReady(itemId: string): void {
    const item = this.props.items.find((i) => i.id === itemId);
    if (item) {
      item.status = "ready";
    }
  }

  public markItemServed(itemId: string): void {
    const item = this.props.items.find((i) => i.id === itemId);
    if (item) {
      item.status = "served";
    }
  }

  public completeOrder(): void {
    this.props.completedTime = new Date();
    this.props.items.forEach((item) => {
      item.status = "served";
    });
  }

  public getWaitingTime(): number {
    if (!this.props.startCookingTime) return 0;
    return Math.floor((Date.now() - this.props.startCookingTime.getTime()) / 1000 / 60);
  }
}

import { AggregateRoot } from "@satset/shared";

export type InventoryItemProps = {
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  warehouse: string;
  reorderPoint: number;
  lastRestockDate: Date;
};

export class InventoryItem extends AggregateRoot<string> {
  private props: InventoryItemProps;

  constructor(id: string, props: InventoryItemProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.sku?.trim()) throw new Error("SKU is required");
    if (!this.props.name?.trim()) throw new Error("Item name is required");
    if (this.props.unitPrice < 0) throw new Error("Unit price cannot be negative");
    if (this.props.quantity < 0) throw new Error("Quantity cannot be negative");
    if (this.props.reorderPoint < 0) throw new Error("Reorder point cannot be negative");
  }

  public get sku(): string {
    return this.props.sku;
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get unitPrice(): number {
    return this.props.unitPrice;
  }

  public get quantity(): number {
    return this.props.quantity;
  }

  public get warehouse(): string {
    return this.props.warehouse;
  }

  public get reorderPoint(): number {
    return this.props.reorderPoint;
  }

  public get totalValue(): number {
    return this.props.quantity * this.props.unitPrice;
  }

  public get needsReorder(): boolean {
    return this.props.quantity <= this.props.reorderPoint;
  }

  public addStock(quantity: number): void {
    if (quantity < 0) throw new Error("Cannot add negative quantity");
    this.props.quantity += quantity;
    this.props.lastRestockDate = new Date();
  }

  public removeStock(quantity: number): void {
    if (quantity < 0) throw new Error("Cannot remove negative quantity");
    if (this.props.quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${this.props.quantity}`);
    }
    this.props.quantity -= quantity;
  }

  public adjustStock(newQuantity: number): void {
    if (newQuantity < 0) throw new Error("Quantity cannot be negative");
    this.props.quantity = newQuantity;
  }
}

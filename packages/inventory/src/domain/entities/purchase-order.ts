import { AggregateRoot } from "@satset/shared";

export type PurchaseLineItem = {
  id: string;
  itemSku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type PurchaseOrderProps = {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  lineItems: PurchaseLineItem[];
  totalAmount: number;
  status: "draft" | "approved" | "received" | "cancelled";
  dueDate: Date;
  receivedDate?: Date;
  notes: string;
  createdAt: Date;
};

export class PurchaseOrder extends AggregateRoot<string> {
  private props: PurchaseOrderProps;

  constructor(id: string, props: PurchaseOrderProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.poNumber?.trim()) throw new Error("PO number is required");
    if (!this.props.supplierId?.trim()) throw new Error("Supplier ID is required");
    if (this.props.lineItems.length === 0) throw new Error("PO must have at least one item");
    if (this.props.totalAmount < 0) throw new Error("Total amount cannot be negative");
  }

  public static create(params: {
    id: string;
    poNumber: string;
    supplierId: string;
    supplierName: string;
    dueDate: Date;
    notes?: string;
  }): PurchaseOrder {
    return new PurchaseOrder(params.id, {
      poNumber: params.poNumber,
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      lineItems: [],
      totalAmount: 0,
      status: "draft",
      dueDate: params.dueDate,
      notes: params.notes || "",
      createdAt: new Date(),
    });
  }

  public get poNumber(): string {
    return this.props.poNumber;
  }

  public get supplierId(): string {
    return this.props.supplierId;
  }

  public get supplierName(): string {
    return this.props.supplierName;
  }

  public get lineItems(): PurchaseLineItem[] {
    return this.props.lineItems;
  }

  public get totalAmount(): number {
    return this.props.totalAmount;
  }

  public get status(): string {
    return this.props.status;
  }

  public get dueDate(): Date {
    return this.props.dueDate;
  }

  public get notes(): string {
    return this.props.notes;
  }

  public addLineItem(item: PurchaseLineItem): void {
    if (this.props.status !== "draft") {
      throw new Error("Cannot add items to non-draft PO");
    }

    const existing = this.props.lineItems.find((li) => li.itemSku === item.itemSku);
    if (existing) {
      existing.quantity += item.quantity;
      existing.subtotal = existing.quantity * existing.unitPrice;
    } else {
      this.props.lineItems.push(item);
    }

    this.recalculateTotal();
  }

  public removeLineItem(itemSku: string): void {
    if (this.props.status !== "draft") {
      throw new Error("Cannot remove items from non-draft PO");
    }

    this.props.lineItems = this.props.lineItems.filter((li) => li.itemSku !== itemSku);
    this.recalculateTotal();
  }

  public approve(): void {
    if (this.props.status !== "draft") {
      throw new Error("Only draft POs can be approved");
    }
    this.props.status = "approved";
  }

  public markReceived(): void {
    if (this.props.status !== "approved") {
      throw new Error("Only approved POs can be marked as received");
    }
    this.props.status = "received";
    this.props.receivedDate = new Date();
  }

  public cancel(): void {
    if (["received", "cancelled"].includes(this.props.status)) {
      throw new Error("Cannot cancel received or already cancelled PO");
    }
    this.props.status = "cancelled";
  }

  private recalculateTotal(): void {
    this.props.totalAmount = this.props.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  }
}

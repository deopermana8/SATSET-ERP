import { AggregateRoot } from "../../shared/aggregate-root";
import { ReservationId } from "../value-objects/reservation-id";

export enum InvoiceStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

export type InvoiceLineItem = {
  description: string;
  amount: number;
};

export type InvoiceProps = {
  reservationId: ReservationId;
  invoiceNumber: string;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  issuedAt: Date;
  dueDate: Date;
  paid?: boolean;
  status?: InvoiceStatus;
};

export class Invoice extends AggregateRoot<string> {
  private props: InvoiceProps;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(id: string, props: InvoiceProps) {
    super(id);
    this.props = { ...props };
    this.props.status = this.props.status ?? InvoiceStatus.UNPAID;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.props.invoiceNumber?.trim()) {
      throw new Error("Invoice number is required");
    }

    if (this.props.lineItems.length === 0) {
      throw new Error("Invoice requires at least one line item");
    }

    if (this.props.totalAmount <= 0) {
      throw new Error("Invoice total amount must be positive");
    }

    if (this.props.dueDate <= this.props.issuedAt) {
      throw new Error("Invoice due date must be after issued date");
    }
  }

  public get reservationId(): ReservationId {
    return this.props.reservationId;
  }

  public get invoiceNumber(): string {
    return this.props.invoiceNumber;
  }

  public get lineItems(): InvoiceLineItem[] {
    return this.props.lineItems;
  }

  public get totalAmount(): number {
    return this.props.totalAmount;
  }

  public get issuedAt(): Date {
    return this.props.issuedAt;
  }

  public get dueDate(): Date {
    return this.props.dueDate;
  }

  public get paid(): boolean {
    return this.props.paid ?? false;
  }

  public get status(): InvoiceStatus {
    return this.props.status!;
  }

  public markPaid(): void {
    if (this.paid) {
      return;
    }

    this.props.paid = true;
    this.props.status = InvoiceStatus.PAID;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}

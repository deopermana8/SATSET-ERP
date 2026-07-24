import { AggregateRoot } from "../../shared/aggregate-root";
import { ReservationId } from "../value-objects/reservation-id";
import { QuotationStatus } from "../value-objects/quotation-status";

export type QuotationLineItem = {
  description: string;
  unitPrice: number;
  quantity: number;
};

export type QuotationProps = {
  reservationId: ReservationId;
  totalAmount: number;
  lineItems: QuotationLineItem[];
  expiresAt: Date;
  status?: QuotationStatus;
};

export class Quotation extends AggregateRoot<string> {
  private props: QuotationProps;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(id: string, props: QuotationProps) {
    super(id);
    this.props = { ...props };
    // ensure default status
    this.props.status = this.props.status ?? QuotationStatus.DRAFT;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (this.props.lineItems.length === 0) {
      throw new Error("Quotation requires at least one line item");
    }

    if (this.props.totalAmount <= 0) {
      throw new Error("Quotation total amount must be positive");
    }

    if (this.props.expiresAt <= new Date()) {
      throw new Error("Quotation expiration must be in the future");
    }
  }

  public get reservationId(): ReservationId {
    return this.props.reservationId;
  }

  public get lineItems(): QuotationLineItem[] {
    return this.props.lineItems;
  }

  public get totalAmount(): number {
    return this.props.totalAmount;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public get status(): QuotationStatus {
    return this.props.status!;
  }

  public markFinal(): void {
    this.props.status = QuotationStatus.FINAL;
    this.touch();
  }

  public get created(): Date {
    return this.createdAt;
  }

  public get updated(): Date {
    return this.updatedAt;
  }

  public refreshExpiration(expiresAt: Date): void {
    if (expiresAt <= new Date()) {
      throw new Error("New expiration must be in the future");
    }

    this.props.expiresAt = expiresAt;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}

import { AggregateRoot } from "../../shared/aggregate-root";
import { ReservationId } from "../value-objects/reservation-id";

export type PaymentProps = {
  reservationId: ReservationId;
  amount: number;
  method: string;
  receivedAt: Date;
  reference?: string;
};

export class Payment extends AggregateRoot<string> {
  private props: PaymentProps;
  private createdAt: Date;

  constructor(id: string, props: PaymentProps) {
    super(id);
    this.props = props;
    this.createdAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.props.method?.trim()) {
      throw new Error("Payment method is required");
    }

    if (this.props.amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    if (!(this.props.receivedAt instanceof Date) || isNaN(this.props.receivedAt.valueOf())) {
      throw new Error("Payment receivedAt must be a valid date");
    }
  }

  public get reservationId(): ReservationId {
    return this.props.reservationId;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get method(): string {
    return this.props.method;
  }

  public get receivedAt(): Date {
    return this.props.receivedAt;
  }

  public get reference(): string | undefined {
    return this.props.reference;
  }

  public get created(): Date {
    return this.createdAt;
  }
}

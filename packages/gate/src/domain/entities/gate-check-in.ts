import { AggregateRoot } from "@satset/shared";
import { ReservationId } from "@satset/reservation";

export type GateCheckInProps = {
  reservationId: ReservationId;
  ticketNumber: string;
  checkedInAt: Date;
  guestName: string;
  guestCount: number;
};

export class GateCheckIn extends AggregateRoot<string> {
  private props: GateCheckInProps;
  private createdAt: Date;

  constructor(id: string, props: GateCheckInProps) {
    super(id);
    this.props = props;
    this.createdAt = new Date();
    this.validate();
  }

  private validate(): void {
    if (!this.props.ticketNumber?.trim()) {
      throw new Error("Ticket number is required");
    }

    if (!this.props.guestName?.trim()) {
      throw new Error("Guest name is required");
    }

    if (this.props.guestCount <= 0) {
      throw new Error("Guest count must be positive");
    }

    if (!(this.props.checkedInAt instanceof Date) || isNaN(this.props.checkedInAt.valueOf())) {
      throw new Error("Check-in time must be a valid date");
    }
  }

  public get reservationId(): ReservationId {
    return this.props.reservationId;
  }

  public get ticketNumber(): string {
    return this.props.ticketNumber;
  }

  public get checkedInAt(): Date {
    return this.props.checkedInAt;
  }

  public get guestName(): string {
    return this.props.guestName;
  }

  public get guestCount(): number {
    return this.props.guestCount;
  }

  public get created(): Date {
    return this.createdAt;
  }
}

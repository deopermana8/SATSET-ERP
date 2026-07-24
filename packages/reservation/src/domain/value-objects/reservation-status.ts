import { ValueObject } from "../../shared/value-object";

export type ReservationStatusType = "PENDING" | "HOLD" | "CONFIRMED" | "CANCELLED" | "RELEASED";

export class ReservationStatus extends ValueObject<{ status: ReservationStatusType }> {
  public static readonly PENDING = new ReservationStatus("PENDING");
  public static readonly HOLD = new ReservationStatus("HOLD");
  public static readonly CONFIRMED = new ReservationStatus("CONFIRMED");
  public static readonly CANCELLED = new ReservationStatus("CANCELLED");
  public static readonly RELEASED = new ReservationStatus("RELEASED");

  constructor(status: ReservationStatusType) {
    super({ status });
  }

  public get value(): ReservationStatusType {
    return this.props.status;
  }

  public isTerminal(): boolean {
    return this.value === "CANCELLED" || this.value === "RELEASED";
  }

  public toString(): string {
    return this.value;
  }

  public static fromString(status: ReservationStatusType): ReservationStatus {
    switch (status) {
      case "PENDING":
        return ReservationStatus.PENDING;
      case "HOLD":
        return ReservationStatus.HOLD;
      case "CONFIRMED":
        return ReservationStatus.CONFIRMED;
      case "CANCELLED":
        return ReservationStatus.CANCELLED;
      case "RELEASED":
        return ReservationStatus.RELEASED;
      default:
        throw new Error(`Unsupported reservation status: ${status}`);
    }
  }
}

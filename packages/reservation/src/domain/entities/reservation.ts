abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public get id(): T {
    return this._id;
  }
}

abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}

import { ReservationId } from "../value-objects/reservation-id";

type ReservationStatusType = "PENDING" | "HOLD" | "CONFIRMED" | "CANCELLED" | "RELEASED";

class ReservationStatus {
  public static readonly PENDING = new ReservationStatus("PENDING");
  public static readonly HOLD = new ReservationStatus("HOLD");
  public static readonly CONFIRMED = new ReservationStatus("CONFIRMED");
  public static readonly CANCELLED = new ReservationStatus("CANCELLED");
  public static readonly RELEASED = new ReservationStatus("RELEASED");

  constructor(private readonly status: ReservationStatusType) {}

  public get value(): ReservationStatusType {
    return this.status;
  }

  public isTerminal(): boolean {
    return this.value === "CANCELLED" || this.value === "RELEASED";
  }

  public toString(): string {
    return this.value;
  }
}

import { GuestCount } from "../value-objects/guest-count";
import { Guest } from "./guest";
import { Package as ReservationPackage } from "./package";
import { Schedule } from "./schedule";

export type ReservationProps = {
  guest: Guest;
  reservationPackage: ReservationPackage;
  schedule: Schedule;
  guestCount: GuestCount;
  notes?: string;
  holdExpiresAt?: Date;
};

export class Reservation extends AggregateRoot<string> {
  private props: ReservationProps;
  private status: ReservationStatus;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(reservationId: ReservationId, props: ReservationProps, status: ReservationStatus, createdAt: Date, updatedAt: Date) {
    super(reservationId.toString());

    this.props = props;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static createPending(params: {
    reservationId: ReservationId;
    guest: Guest;
    reservationPackage: ReservationPackage;
    schedule: Schedule;
    guestCount: GuestCount;
    notes?: string;
    holdExpiresAt?: Date;
  }): Reservation {
    const now = new Date();
    return new Reservation(
      params.reservationId,
      {
        guest: params.guest,
        reservationPackage: params.reservationPackage,
        schedule: params.schedule,
        guestCount: params.guestCount,
        notes: params.notes,
        holdExpiresAt: params.holdExpiresAt,
      },
      ReservationStatus.PENDING,
      now,
      now,
    );
  }

  public get reservationId(): ReservationId {
    return new ReservationId(this.id);
  }

  public get guest(): Guest {
    return this.props.guest;
  }

  public get reservationPackage(): ReservationPackage {
    return this.props.reservationPackage;
  }

  public get schedule(): Schedule {
    return this.props.schedule;
  }

  public get guestCount(): GuestCount {
    return this.props.guestCount;
  }

  public get notes(): string | undefined {
    return this.props.notes;
  }

  public get holdExpiresAt(): Date | undefined {
    return this.props.holdExpiresAt;
  }

  public get currentStatus(): ReservationStatus {
    return this.status;
  }

  public get created(): Date {
    return this.createdAt;
  }

  public get updated(): Date {
    return this.updatedAt;
  }

  public confirm(): void {
    if (this.status.isTerminal()) {
      throw new Error("Cannot confirm a reservation that is already finalised");
    }

    this.status = ReservationStatus.CONFIRMED;
    this.touch();
  }

  public cancel(reason?: string): void {
    if (this.status === ReservationStatus.CANCELLED) {
      return;
    }

    if (this.status === ReservationStatus.RELEASED) {
      throw new Error("Cannot cancel a released reservation");
    }

    this.status = ReservationStatus.CANCELLED;
    this.props.notes = reason ? `${this.props.notes ?? ""}${reason}`.trim() : this.props.notes;
    this.touch();
  }

  public release(): void {
    if (this.status.isTerminal()) {
      return;
    }

    this.status = ReservationStatus.RELEASED;
    this.touch();
  }

  public placeOnHold(until: Date): void {
    if (this.status.isTerminal()) {
      throw new Error("Cannot hold a terminal reservation");
    }

    if (until <= new Date()) {
      throw new Error("Hold expiration must be a future moment");
    }

    this.status = ReservationStatus.HOLD;
    this.props.holdExpiresAt = until;
    this.touch();
  }

  public isPending(): boolean {
    return this.status === ReservationStatus.PENDING;
  }

  public isConfirmed(): boolean {
    return this.status === ReservationStatus.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this.status === ReservationStatus.CANCELLED;
  }

  public isReleased(): boolean {
    return this.status === ReservationStatus.RELEASED;
  }

  public ensureAvailability(): void {
    if (this.guestCount.value > this.reservationPackage.capacity) {
      throw new Error("Guest count exceeds package capacity");
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}

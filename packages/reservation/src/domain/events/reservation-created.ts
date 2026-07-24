import { ReservationId } from "../value-objects/reservation-id";

export type ReservationCreatedPayload = {
  reservationId: ReservationId;
  occurredAt: Date;
};

export class ReservationCreated {
  public readonly reservationId: ReservationId;
  public readonly occurredAt: Date;

  constructor(payload: ReservationCreatedPayload) {
    this.reservationId = payload.reservationId;
    this.occurredAt = payload.occurredAt;
  }
}

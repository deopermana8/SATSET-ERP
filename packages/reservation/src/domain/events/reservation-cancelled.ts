import { ReservationId } from "../value-objects/reservation-id";

export type ReservationCancelledPayload = {
  reservationId: ReservationId;
  cancelledAt: Date;
  reason?: string;
};

export class ReservationCancelled {
  public readonly reservationId: ReservationId;
  public readonly cancelledAt: Date;
  public readonly reason?: string;

  constructor(payload: ReservationCancelledPayload) {
    this.reservationId = payload.reservationId;
    this.cancelledAt = payload.cancelledAt;
    this.reason = payload.reason;
  }
}

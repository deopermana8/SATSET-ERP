import { ReservationId } from "../value-objects/reservation-id";

export type ReservationConfirmedPayload = {
  reservationId: ReservationId;
  confirmedAt: Date;
};

export class ReservationConfirmed {
  public readonly reservationId: ReservationId;
  public readonly confirmedAt: Date;

  constructor(payload: ReservationConfirmedPayload) {
    this.reservationId = payload.reservationId;
    this.confirmedAt = payload.confirmedAt;
  }
}

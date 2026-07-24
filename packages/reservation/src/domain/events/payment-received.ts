import { ReservationId } from "../value-objects/reservation-id";

export type PaymentReceivedPayload = {
  reservationId: ReservationId;
  amount: number;
  receivedAt: Date;
  reference?: string;
};

export class PaymentReceived {
  public readonly reservationId: ReservationId;
  public readonly amount: number;
  public readonly receivedAt: Date;
  public readonly reference?: string;

  constructor(payload: PaymentReceivedPayload) {
    this.reservationId = payload.reservationId;
    this.amount = payload.amount;
    this.receivedAt = payload.receivedAt;
    this.reference = payload.reference;
  }
}

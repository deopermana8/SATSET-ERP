import { ReservationId } from "../value-objects/reservation-id";

export type TicketIssuedPayload = {
  reservationId: ReservationId;
  ticketNumber: string;
  issuedAt: Date;
};

export class TicketIssued {
  public readonly reservationId: ReservationId;
  public readonly ticketNumber: string;
  public readonly issuedAt: Date;

  constructor(payload: TicketIssuedPayload) {
    this.reservationId = payload.reservationId;
    this.ticketNumber = payload.ticketNumber;
    this.issuedAt = payload.issuedAt;
  }
}

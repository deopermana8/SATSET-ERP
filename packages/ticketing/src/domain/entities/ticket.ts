import TicketId from "../value-objects/ticket-id";

export type TicketProps = {
  id: TicketId;
  reservationId: string;
  ticketNumber: string;
  issuedAt: Date;
  qrPayload: string;
};

export class Ticket {
  public readonly id: TicketId;
  public readonly reservationId: string;
  public readonly ticketNumber: string;
  public readonly issuedAt: Date;
  public readonly qrPayload: string;

  constructor(props: TicketProps) {
    this.id = props.id;
    this.reservationId = props.reservationId;
    this.ticketNumber = props.ticketNumber;
    this.issuedAt = props.issuedAt;
    this.qrPayload = props.qrPayload;
  }

  toJSON() {
    return {
      id: this.id.id,
      reservationId: this.reservationId,
      ticketNumber: this.ticketNumber,
      issuedAt: this.issuedAt.toISOString(),
      qrPayload: this.qrPayload,
    };
  }
}

export default Ticket;

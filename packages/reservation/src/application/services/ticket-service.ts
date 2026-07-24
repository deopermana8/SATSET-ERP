import { ReservationId } from "../../domain/value-objects/reservation-id";
import { Ticket, TicketId } from "@satset/ticketing";
import { WorkflowDashboardStore } from "@satset/shared";

export class TicketService {
  constructor(private readonly dashboard: WorkflowDashboardStore) {}

  public generate(reservationId: ReservationId): Ticket {
    const ticketNumber = `T-${Date.now().toString(36).toUpperCase()}`;
    const ticket = new Ticket({
      id: TicketId.generate(),
      reservationId: reservationId.value,
      ticketNumber,
      issuedAt: new Date(),
      qrPayload: Buffer.from(
        JSON.stringify({
          reservationId: reservationId.value,
          ticketNumber,
        }),
      ).toString("base64"),
    });

    this.dashboard.increment("tickets");
    return ticket;
  }
}

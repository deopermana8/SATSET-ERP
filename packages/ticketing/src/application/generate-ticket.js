import Ticket from "../domain/entities/ticket";
import TicketId from "../domain/value-objects/ticket-id";
export function generateTicketForReservation(reservationId) {
    const ticketNumber = `T-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
    const id = TicketId.generate();
    const issuedAt = new Date();
    const payload = {
        reservationId,
        ticketNumber,
        issuedAt: issuedAt.toISOString(),
    };
    const qrPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
    return new Ticket({ id, reservationId, ticketNumber, issuedAt, qrPayload });
}
export default generateTicketForReservation;

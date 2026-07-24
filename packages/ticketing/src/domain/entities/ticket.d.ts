import TicketId from "../value-objects/ticket-id";
export type TicketProps = {
    id: TicketId;
    reservationId: string;
    ticketNumber: string;
    issuedAt: Date;
    qrPayload: string;
};
export declare class Ticket {
    readonly id: TicketId;
    readonly reservationId: string;
    readonly ticketNumber: string;
    readonly issuedAt: Date;
    readonly qrPayload: string;
    constructor(props: TicketProps);
    toJSON(): {
        id: string;
        reservationId: string;
        ticketNumber: string;
        issuedAt: string;
        qrPayload: string;
    };
}
export default Ticket;
//# sourceMappingURL=ticket.d.ts.map
export class Ticket {
    constructor(props) {
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

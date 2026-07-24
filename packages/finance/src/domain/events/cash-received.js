export class CashReceived {
    constructor(payload) {
        this.reference = payload.reference;
        this.amount = payload.amount;
        this.occurredAt = payload.occurredAt;
        this.description = payload.description;
    }
}

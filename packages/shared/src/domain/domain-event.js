export class DomainEvent {
    constructor(occurredAt = new Date()) {
        this.occurredAt = occurredAt;
    }
}

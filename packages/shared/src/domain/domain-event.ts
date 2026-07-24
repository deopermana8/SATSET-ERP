export abstract class DomainEvent {
  public readonly occurredAt: Date;

  protected constructor(occurredAt: Date = new Date()) {
    this.occurredAt = occurredAt;
  }
}
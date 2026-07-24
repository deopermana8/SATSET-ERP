export type CashReceivedPayload = {
  reference: string;
  amount: number;
  occurredAt: Date;
  description: string;
};

export class CashReceived {
  public readonly reference: string;
  public readonly amount: number;
  public readonly occurredAt: Date;
  public readonly description: string;

  constructor(payload: CashReceivedPayload) {
    this.reference = payload.reference;
    this.amount = payload.amount;
    this.occurredAt = payload.occurredAt;
    this.description = payload.description;
  }
}

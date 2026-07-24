export type JournalCreatedPayload = {
  journalNumber: string;
  description: string;
  debit: number;
  credit: number;
  occurredAt: Date;
};

export class JournalCreated {
  public readonly journalNumber: string;
  public readonly description: string;
  public readonly debit: number;
  public readonly credit: number;
  public readonly occurredAt: Date;

  constructor(payload: JournalCreatedPayload) {
    this.journalNumber = payload.journalNumber;
    this.description = payload.description;
    this.debit = payload.debit;
    this.credit = payload.credit;
    this.occurredAt = payload.occurredAt;
  }
}

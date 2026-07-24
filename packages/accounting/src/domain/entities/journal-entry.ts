import { AggregateRoot } from "@satset/shared";

export type JournalEntryProps = {
  journalNumber: string;
  description: string;
  debit: number;
  credit: number;
  createdAt: Date;
};

export class JournalEntry extends AggregateRoot<string> {
  private props: JournalEntryProps;

  constructor(id: string, props: JournalEntryProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.journalNumber?.trim()) throw new Error("Journal number is required");
    if (this.props.debit <= 0 || this.props.credit <= 0) throw new Error("Debit and credit must be positive");
  }

  public get journalNumber(): string {
    return this.props.journalNumber;
  }

  public get description(): string {
    return this.props.description;
  }

  public get debit(): number {
    return this.props.debit;
  }

  public get credit(): number {
    return this.props.credit;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}

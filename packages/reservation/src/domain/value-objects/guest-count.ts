import { ValueObject } from "../../shared/value-object";

export class GuestCount extends ValueObject<{ count: number }> {
  constructor(count: number) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("GuestCount must be a positive integer");
    }

    super({ count });
  }

  public get value(): number {
    return this.props.count;
  }

  public toString(): string {
    return String(this.value);
  }
}

import { ValueObject } from "../../shared/value-object";

export class ReservationId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    const normalized = value?.trim();

    if (!normalized) {
      throw new Error("ReservationId must be a non-empty string");
    }

    super({ value: normalized });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.value;
  }
}

import { ValueObject } from "../../shared/value-object";

export type QuotationStatusType = "DRAFT" | "FINAL";

export class QuotationStatus extends ValueObject<{ status: QuotationStatusType }> {
  public static readonly DRAFT = new QuotationStatus("DRAFT");
  public static readonly FINAL = new QuotationStatus("FINAL");

  constructor(status: QuotationStatusType) {
    super({ status });
  }

  public get value(): QuotationStatusType {
    return this.props.status;
  }

  public toString(): string {
    return this.value;
  }
}

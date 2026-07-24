import { ValueObject } from "../../shared/value-object";

export type InvoiceStatusType = "UNPAID" | "PAID";

export class InvoiceStatus extends ValueObject<{ status: InvoiceStatusType }> {
  public static readonly UNPAID = new InvoiceStatus("UNPAID");
  public static readonly PAID = new InvoiceStatus("PAID");

  constructor(status: InvoiceStatusType) {
    super({ status });
  }

  public get value(): InvoiceStatusType {
    return this.props.status;
  }

  public toString(): string {
    return this.value;
  }
}

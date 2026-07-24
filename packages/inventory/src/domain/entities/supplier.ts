import { AggregateRoot } from "@satset/shared";

export type SupplierProps = {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  bankAccount?: string;
  isActive: boolean;
};

export class Supplier extends AggregateRoot<string> {
  private props: SupplierProps;

  constructor(id: string, props: SupplierProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.code?.trim()) throw new Error("Supplier code is required");
    if (!this.props.name?.trim()) throw new Error("Supplier name is required");
    if (!this.props.phone?.trim()) throw new Error("Phone number is required");
    if (!this.props.address?.trim()) throw new Error("Address is required");
  }

  public static create(params: {
    id: string;
    code: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  }): Supplier {
    return new Supplier(params.id, {
      code: params.code,
      name: params.name,
      contactPerson: params.contactPerson,
      phone: params.phone,
      email: params.email,
      address: params.address,
      city: params.city,
      isActive: true,
    });
  }

  public get code(): string {
    return this.props.code;
  }

  public get name(): string {
    return this.props.name;
  }

  public get contactPerson(): string {
    return this.props.contactPerson;
  }

  public get phone(): string {
    return this.props.phone;
  }

  public get email(): string {
    return this.props.email;
  }

  public get address(): string {
    return this.props.address;
  }

  public get city(): string {
    return this.props.city;
  }

  public get bankAccount(): string | undefined {
    return this.props.bankAccount;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public activate(): void {
    this.props.isActive = true;
  }
}

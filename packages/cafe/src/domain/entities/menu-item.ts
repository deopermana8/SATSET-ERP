abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public get id(): T {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (entity.constructor !== this.constructor) {
      return false;
    }

    return this._id === entity._id;
  }
}

abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}

export type MenuItemProps = {
  code: string;
  name: string;
  description: string;
  price: number;
  category: "makanan" | "minuman" | "snack" | "dessert";
  available: boolean;
  prepTime?: number; // minutes
};

export class MenuItem extends AggregateRoot<string> {
  private props: MenuItemProps;

  constructor(id: string, props: MenuItemProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.code?.trim()) throw new Error("Menu item code is required");
    if (!this.props.name?.trim()) throw new Error("Menu item name is required");
    if (this.props.price < 0) throw new Error("Price cannot be negative");
  }

  public get code(): string {
    return this.props.code;
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get price(): number {
    return this.props.price;
  }

  public get category(): string {
    return this.props.category;
  }

  public get available(): boolean {
    return this.props.available;
  }

  public get prepTime(): number | undefined {
    return this.props.prepTime;
  }

  public setAvailable(available: boolean): void {
    this.props.available = available;
  }
}

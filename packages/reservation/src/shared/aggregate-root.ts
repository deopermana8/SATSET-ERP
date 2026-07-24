import { Entity } from "./entity";

export abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}

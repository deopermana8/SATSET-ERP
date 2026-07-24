export class Package {
  public readonly code: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly capacity: number;

  constructor(params: {
    code: string;
    name: string;
    capacity: number;
    description?: string;
  }) {
    if (!params.code?.trim()) {
      throw new Error("Package code is required");
    }

    if (!params.name?.trim()) {
      throw new Error("Package name is required");
    }

    if (!Number.isInteger(params.capacity) || params.capacity <= 0) {
      throw new Error("Package capacity must be a positive integer");
    }

    this.code = params.code.trim();
    this.name = params.name.trim();
    this.capacity = params.capacity;
    this.description = params.description?.trim();
  }
}

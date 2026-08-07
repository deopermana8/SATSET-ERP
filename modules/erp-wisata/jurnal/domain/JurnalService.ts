import { JurnalRepository } from "./JurnalRepository";

export class JurnalService {
  constructor(private readonly repository: JurnalRepository) {}

  async create(input: Record<string, unknown>): Promise<{ id: string }> {
    return this.repository.create(input);
  }

  async detail(id: string): Promise<Record<string, unknown> | null> {
    return this.repository.findById(id);
  }

  async list(input: { filter?: Record<string, unknown>; page: number; size: number }): Promise<readonly Record<string, unknown>[]> {
    return this.repository.findAll(input);
  }

  async update(id: string, input: Record<string, unknown>): Promise<void> {
    await this.repository.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

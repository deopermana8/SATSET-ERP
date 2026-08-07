export interface KasRepository {
  create(input: Record<string, unknown>): Promise<{ id: string }>;
  findById(id: string): Promise<Record<string, unknown> | null>;
  findAll(input: { filter?: Record<string, unknown>; page: number; size: number }): Promise<readonly Record<string, unknown>[]>;
  update(id: string, input: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}

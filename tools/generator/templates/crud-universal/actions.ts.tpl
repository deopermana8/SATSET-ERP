export interface {{names.entity.pascal}}Actions {
  create(payload: Record<string, unknown>): Promise<void>;
  update(id: string, payload: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}

export async function handleDelete{{names.entity.pascal}}(id: string): Promise<void> {
  void id;
}

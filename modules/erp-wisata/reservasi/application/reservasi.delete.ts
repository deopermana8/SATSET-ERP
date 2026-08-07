export interface ReservasiActions {
  create(payload: Record<string, unknown>): Promise<void>;
  update(id: string, payload: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}

export async function handleDeleteReservasi(id: string): Promise<void> {
  void id;
}

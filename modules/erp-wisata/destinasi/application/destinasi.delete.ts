export interface DestinasiActions {
  create(payload: Record<string, unknown>): Promise<void>;
  update(id: string, payload: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}

export async function handleDeleteDestinasi(id: string): Promise<void> {
  void id;
}

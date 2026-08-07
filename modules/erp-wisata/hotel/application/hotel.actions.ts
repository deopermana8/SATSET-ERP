export interface HotelActions {
  create(payload: Record<string, unknown>): Promise<void>;
  update(id: string, payload: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}

export async function handleDeleteHotel(id: string): Promise<void> {
  void id;
}

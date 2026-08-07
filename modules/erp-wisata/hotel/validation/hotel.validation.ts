export interface HotelValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateHotel(payload: Record<string, unknown>): HotelValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

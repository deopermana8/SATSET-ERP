export interface ReservasiValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateReservasi(payload: Record<string, unknown>): ReservasiValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

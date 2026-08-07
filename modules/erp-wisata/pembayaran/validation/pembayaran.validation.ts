export interface PembayaranValidationResult {
  errors: string[];
  ok: boolean;
}

export function validatePembayaran(payload: Record<string, unknown>): PembayaranValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

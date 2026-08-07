export interface KendaraanValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateKendaraan(payload: Record<string, unknown>): KendaraanValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

export interface PaketWisataValidationResult {
  errors: string[];
  ok: boolean;
}

export function validatePaketWisata(payload: Record<string, unknown>): PaketWisataValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

export interface KasValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateKas(payload: Record<string, unknown>): KasValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

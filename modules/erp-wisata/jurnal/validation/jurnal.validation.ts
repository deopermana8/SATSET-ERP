export interface JurnalValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateJurnal(payload: Record<string, unknown>): JurnalValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

export interface {{names.entity.pascal}}ValidationResult {
  errors: string[];
  ok: boolean;
}

export function validate{{names.entity.pascal}}(payload: Record<string, unknown>): {{names.entity.pascal}}ValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

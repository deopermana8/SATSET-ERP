export interface GuideValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateGuide(payload: Record<string, unknown>): GuideValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

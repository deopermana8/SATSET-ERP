export interface DestinasiValidationResult {
  errors: string[];
  ok: boolean;
}

export function validateDestinasi(payload: Record<string, unknown>): DestinasiValidationResult {
  void payload;
  return {
    errors: [],
    ok: true
  };
}

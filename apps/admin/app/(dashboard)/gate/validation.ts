export type GateValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateGate(
  data: Record<string, unknown>
): GateValidationResult {
  const errors: Record<string, string> = {};

  if (
    data.name !== undefined &&
    String(data.name).trim() === ""
  ) {
    errors.name = "Nama wajib diisi";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export type CreateGateInput = {
  name: string;
  code: string;
  destinationId: number;
  active?: boolean;
};

export type UpdateGateInput = Partial<CreateGateInput>;

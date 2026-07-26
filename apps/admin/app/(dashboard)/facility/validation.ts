export type FacilityValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateFacility(
  data: Record<string, unknown>
): FacilityValidationResult {
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

export type CreateFacilityInput = {
  name: string;
  slug?: string;
  description?: string | null;
  destinationId: number;
  active?: boolean;
};

export type UpdateFacilityInput = Partial<CreateFacilityInput>;
export type DestinationValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export type CreateDestinationInput = {
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type UpdateDestinationInput = Partial<CreateDestinationInput>;

export function validateDestination(
  data: Record<string, unknown>
): DestinationValidationResult {
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
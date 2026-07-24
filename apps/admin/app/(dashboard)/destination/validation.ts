export type DestinationValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

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
export type CategoryValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateCategory(
  data: Record<string, unknown>
): CategoryValidationResult {
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

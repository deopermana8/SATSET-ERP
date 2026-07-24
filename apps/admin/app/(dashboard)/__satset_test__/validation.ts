export type __satset_test__ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validate__satset_test__(
  data: Record<string, unknown>
): __satset_test__ValidationResult {
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
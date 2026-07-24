export type PaymentValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validatePayment(
  data: Record<string, unknown>
): PaymentValidationResult {
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
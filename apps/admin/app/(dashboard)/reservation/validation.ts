export type ReservationValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateReservation(
  data: Record<string, unknown>
): ReservationValidationResult {
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
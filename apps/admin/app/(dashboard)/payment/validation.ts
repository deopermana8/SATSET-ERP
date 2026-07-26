export type PaymentValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validatePayment(data: Record<string, unknown>): PaymentValidationResult {
  const errors: Record<string, string> = {};

  if (data.reservationId !== undefined && !Number.isFinite(Number(data.reservationId))) errors.reservationId = "ReservationId tidak valid";
  if (data.amount !== undefined && !Number.isFinite(Number(data.amount))) errors.amount = "Amount tidak valid";

  return { valid: Object.keys(errors).length === 0, errors };
}

export type CreatePaymentInput = {
  reservationId: number;
  amount: number;
  method?: string;
  status?: string;
  paidAt?: string | null;
};

export type UpdatePaymentInput = Partial<CreatePaymentInput>;

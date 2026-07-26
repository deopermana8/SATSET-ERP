export type TicketValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateTicket(
  data: Record<string, unknown>
): TicketValidationResult {
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

export type CreateTicketInput = {
  name: string;
  type: string;
  price: number;
  destinationId?: number | null;
  active?: boolean;
};

export type UpdateTicketInput = Partial<CreateTicketInput>;
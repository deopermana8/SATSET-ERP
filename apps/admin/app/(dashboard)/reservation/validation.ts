export type ReservationValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateReservation(data: Record<string, unknown>): ReservationValidationResult {
  const errors: Record<string, string> = {};

  if (data.code !== undefined && String(data.code).trim() === "") errors.code = "Code wajib diisi";
  if (data.visitorId !== undefined && !Number.isFinite(Number(data.visitorId))) errors.visitorId = "VisitorId tidak valid";
  if (data.destinationId !== undefined && !Number.isFinite(Number(data.destinationId))) errors.destinationId = "DestinationId tidak valid";
  if (data.ticketId !== undefined && !Number.isFinite(Number(data.ticketId))) errors.ticketId = "TicketId tidak valid";
  if (data.quantity !== undefined && (!Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0)) errors.quantity = "Quantity tidak valid";
  if (data.totalPrice !== undefined && !Number.isFinite(Number(data.totalPrice))) errors.totalPrice = "Total price tidak valid";

  return { valid: Object.keys(errors).length === 0, errors };
}

export type CreateReservationInput = {
  code: string;
  visitorId: number;
  destinationId: number;
  ticketId: number;
  quantity: number;
  totalPrice: number;
  status?: string;
  visitDate?: string | null;
};

export type UpdateReservationInput = Partial<CreateReservationInput>;

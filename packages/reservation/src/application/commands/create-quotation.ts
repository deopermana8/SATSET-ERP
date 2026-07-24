import { Quotation } from "../../domain/entities/quotation";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { Reservation } from "../../domain/entities/reservation";
import { ReservationRepository } from "../../domain/repositories/reservation-repository";

export type CreateQuotationCommand = {
  quotationId: string;
  reservationId: ReservationId;
  reservation: Reservation;
  lineItems: { description: string; unitPrice: number; quantity: number }[];
  expiresAt: Date;
};

export class CreateQuotation {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  public async execute(command: CreateQuotationCommand): Promise<Quotation> {
    const quotation = new Quotation(command.quotationId, {
      reservationId: command.reservationId,
      totalAmount: command.lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      lineItems: command.lineItems,
      expiresAt: command.expiresAt,
    });

    const reservation = await this.reservationRepository.findById(command.reservationId.value);
    if (!reservation) {
      throw new Error(`Reservation not found: ${command.reservationId.value}`);
    }

    return quotation;
  }
}

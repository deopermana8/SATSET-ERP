import { Invoice } from "../../domain/entities/invoice";
import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { ReservationId } from "../../domain/value-objects/reservation-id";

export type GenerateInvoiceCommand = {
  invoiceId: string;
  reservationId: ReservationId;
  invoiceNumber: string;
  lineItems: { description: string; amount: number }[];
  dueDate: Date;
};

export class GenerateInvoice {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  public async execute(command: GenerateInvoiceCommand): Promise<Invoice> {
    const reservation = await this.reservationRepository.findById(command.reservationId.value);
    if (!reservation) {
      throw new Error(`Reservation not found: ${command.reservationId.value}`);
    }

    const invoice = new Invoice(command.invoiceId, {
      reservationId: command.reservationId,
      invoiceNumber: command.invoiceNumber,
      lineItems: command.lineItems,
      totalAmount: command.lineItems.reduce((sum, item) => sum + item.amount, 0),
      issuedAt: new Date(),
      dueDate: command.dueDate,
    });

    return invoice;
  }
}

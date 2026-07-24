import { Payment } from "../../domain/entities/payment";
import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { PaymentReceived } from "../../domain/events/payment-received";

export type ReceivePaymentCommand = {
  paymentId: string;
  reservationId: ReservationId;
  amount: number;
  method: string;
  receivedAt: Date;
  reference?: string;
};

export class ReceivePayment {
  constructor(private readonly repository: ReservationRepository) {}

  public async execute(command: ReceivePaymentCommand): Promise<{ payment: Payment; event: PaymentReceived }> {
    const reservation = await this.repository.findById(command.reservationId.value);
    if (!reservation) {
      throw new Error(`Reservation not found: ${command.reservationId.value}`);
    }

    const payment = new Payment(command.paymentId, {
      reservationId: command.reservationId,
      amount: command.amount,
      method: command.method,
      receivedAt: command.receivedAt,
      reference: command.reference,
    });

    return {
      payment,
      event: new PaymentReceived({
        reservationId: command.reservationId,
        amount: command.amount,
        receivedAt: command.receivedAt,
        reference: command.reference,
      }),
    };
  }
}

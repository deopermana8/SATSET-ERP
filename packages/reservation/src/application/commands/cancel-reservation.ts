import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { ReservationId } from "../../domain/value-objects/reservation-id";

export class CancelReservation {
  constructor(private readonly repository: ReservationRepository) {}

  public async execute(reservationId: ReservationId, reason?: string): Promise<void> {
    const reservation = await this.repository.findById(reservationId.value);

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId.value}`);
    }

    reservation.cancel(reason);
    await this.repository.save(reservation);
  }
}

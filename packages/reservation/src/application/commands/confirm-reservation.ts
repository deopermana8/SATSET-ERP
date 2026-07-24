import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { ReservationConfirmed } from "../../domain/events/reservation-confirmed";

export class ConfirmReservation {
  constructor(private readonly repository: ReservationRepository) {}

  public async execute(reservationId: ReservationId): Promise<ReservationConfirmed> {
    const reservation = await this.repository.findById(reservationId.value);
    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId.value}`);
    }

    reservation.confirm();
    await this.repository.save(reservation);

    return new ReservationConfirmed({
      reservationId,
      confirmedAt: new Date(),
    });
  }
}

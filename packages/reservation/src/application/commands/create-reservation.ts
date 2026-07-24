import { Guest } from "../../domain/entities/guest";
import { Package as ReservationPackage } from "../../domain/entities/package";
import { Reservation } from "../../domain/entities/reservation";
import { Schedule } from "../../domain/entities/schedule";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { GuestCount } from "../../domain/value-objects/guest-count";

export type CreateReservationCommand = {
  reservationId: ReservationId;
  guest: Guest;
  reservationPackage: ReservationPackage;
  schedule: Schedule;
  guestCount: GuestCount;
  notes?: string;
  holdExpiresAt?: Date;
};

export class CreateReservation {
  constructor(private readonly repository: ReservationRepository) {}

  public async execute(command: CreateReservationCommand): Promise<Reservation> {
    const reservation = Reservation.createPending({
      reservationId: command.reservationId,
      guest: command.guest,
      reservationPackage: command.reservationPackage,
      schedule: command.schedule,
      guestCount: command.guestCount,
      notes: command.notes,
      holdExpiresAt: command.holdExpiresAt,
    });

    reservation.ensureAvailability();

    await this.repository.save(reservation);
    return reservation;
  }
}

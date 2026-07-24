import { Reservation } from "../../domain/entities/reservation";
import { ReservationRepository } from "../../domain/repositories/reservation-repository";
import { Schedule } from "../../domain/entities/schedule";

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly reservations = new Map<string, Reservation>();

  public async save(reservation: Reservation): Promise<void> {
    this.reservations.set(reservation.reservationId.value, reservation);
  }

  public async findById(reservationId: string): Promise<Reservation | null> {
    return this.reservations.get(reservationId) ?? null;
  }

  public async findByPackageAndSchedule(packageCode: string, schedule: Schedule): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter((reservation) => {
      return reservation.reservationPackage.code === packageCode && reservation.schedule.overlaps(schedule);
    });
  }
}

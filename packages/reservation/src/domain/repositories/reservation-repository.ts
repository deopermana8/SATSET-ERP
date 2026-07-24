import { Reservation } from "../entities/reservation";
import { Schedule } from "../entities/schedule";

export interface ReservationRepository {
  save(reservation: Reservation): Promise<void>;
  findById(reservationId: string): Promise<Reservation | null>;
  findByPackageAndSchedule(packageCode: string, schedule: Schedule): Promise<Reservation[]>;
}

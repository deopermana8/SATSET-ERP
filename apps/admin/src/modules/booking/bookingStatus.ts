import type { BookingStatus } from "./bookingTypes.js";

const transitionMap: Record<BookingStatus, BookingStatus[]> = {
  Draft: ["Menunggu Pembayaran", "Dibatalkan"],
  "Menunggu Pembayaran": ["Dibayar", "Dibatalkan"],
  Dibayar: ["Dikonfirmasi", "Refund"],
  Dikonfirmasi: ["Check In", "Dibatalkan"],
  "Check In": ["Selesai", "Refund"],
  Selesai: [],
  Dibatalkan: [],
  Refund: [],
};

export function canTransitionBookingStatus(from: BookingStatus, to: BookingStatus): boolean {
  return transitionMap[from].includes(to);
}

export function getNextBookingStatuses(current: BookingStatus): BookingStatus[] {
  return transitionMap[current].slice();
}

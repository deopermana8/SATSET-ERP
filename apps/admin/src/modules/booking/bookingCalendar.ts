import type { BookingCalendarDay, BookingCalendarView, BookingRecord } from "./bookingTypes.js";

function toDateOnly(date: string): string {
  return date.slice(0, 10);
}

function createDateRange(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const dates: string[] = [];

  for (let day = start; day <= end; day = new Date(day.getTime() + 86400000)) {
    dates.push(day.toISOString().slice(0, 10));
  }

  return dates;
}

export function buildBookingCalendar(
  rows: BookingRecord[],
  from: string,
  to: string,
  defaultCapacity: number,
): BookingCalendarView {
  const index = new Map<string, BookingCalendarDay>();

  for (const date of createDateRange(from, to)) {
    index.set(date, {
      date,
      totalBooking: 0,
      totalOrang: 0,
      kapasitas: defaultCapacity,
      terisi: 0,
      tersedia: defaultCapacity,
      waitingList: 0,
      occupancyPercent: 0,
    });
  }

  for (const row of rows) {
    const date = toDateOnly(row.tanggal);
    const day = index.get(date);
    if (!day) {
      continue;
    }

    const aktif = row.status !== "Dibatalkan" && row.status !== "Refund";
    if (!aktif) {
      continue;
    }

    day.totalBooking += 1;
    day.totalOrang += Math.max(0, row.jumlahOrang);
    day.terisi = Math.min(day.kapasitas, day.totalOrang);
    day.waitingList = Math.max(0, day.totalOrang - day.kapasitas);
    day.tersedia = Math.max(0, day.kapasitas - day.terisi);
    day.occupancyPercent = day.kapasitas > 0 ? Math.min(100, Math.round((day.terisi / day.kapasitas) * 100)) : 0;
  }

  return {
    from,
    to,
    days: Array.from(index.values()),
  };
}

export function buildOccupancyCalendar(rows: BookingRecord[], from: string, to: string, defaultCapacity: number): BookingCalendarView {
  return buildBookingCalendar(rows, from, to, defaultCapacity);
}

export function buildCapacityView(rows: BookingRecord[], from: string, to: string, defaultCapacity: number): BookingCalendarView {
  return buildBookingCalendar(rows, from, to, defaultCapacity);
}

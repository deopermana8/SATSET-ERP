import type { BookingRecord, BookingValidationIssue, BookingValidationResult } from "./bookingTypes.js";

function isValidDate(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isPastDate(value: string, now: Date): boolean {
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00`);
  return d < today;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function validateBooking(
  input: Partial<BookingRecord>,
  opts: {
    kapasitasTersedia: number;
    now?: Date;
  },
): BookingValidationResult {
  const issues: BookingValidationIssue[] = [];
  const now = opts.now ?? new Date();

  if (String(input.pelanggan ?? "").trim().length === 0) {
    issues.push({ field: "pelanggan", message: "Pelanggan wajib diisi" });
  }

  if (String(input.paketWisata ?? "").trim().length === 0) {
    issues.push({ field: "paketWisata", message: "Paket wisata wajib diisi" });
  }

  if (!input.tanggal || !isValidDate(input.tanggal)) {
    issues.push({ field: "tanggal", message: "Tanggal tidak valid" });
  } else if (isPastDate(input.tanggal, now)) {
    issues.push({ field: "tanggal", message: "Tanggal tidak boleh lampau" });
  }

  if (!input.jam || !isValidTime(input.jam)) {
    issues.push({ field: "jam", message: "Jam tidak valid, gunakan format HH:mm" });
  }

  const jumlahOrang = Number(input.jumlahOrang ?? 0);
  if (jumlahOrang <= 0) {
    issues.push({ field: "jumlahOrang", message: "Jumlah orang harus lebih dari 0" });
  } else if (jumlahOrang > Math.max(0, opts.kapasitasTersedia)) {
    issues.push({ field: "jumlahOrang", message: "Jumlah orang melebihi kapasitas" });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

import type { BookingRecord, BookingReportKey } from "./bookingTypes.js";

function getWeekOfYear(date: Date): number {
  const first = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date.getTime() - first.getTime()) / 86400000);
  return Math.ceil((day + first.getDay() + 1) / 7);
}

type Bucket = {
  key: string;
  label: string;
  totalBooking: number;
  totalOrang: number;
  totalPendapatan: number;
};

function createBucket(label: string, key: string): Bucket {
  return {
    key,
    label,
    totalBooking: 0,
    totalOrang: 0,
    totalPendapatan: 0,
  };
}

function reportLabel(row: BookingRecord, mode: BookingReportKey): { key: string; label: string } {
  const d = new Date(`${row.tanggal.slice(0, 10)}T00:00:00`);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  if (mode === "harian" || mode === "pembatalan" || mode === "refund" || mode === "no-show" || mode === "occupancy") {
    return { key: `${yyyy}-${mm}-${dd}`, label: `${dd}/${mm}/${yyyy}` };
  }

  if (mode === "mingguan") {
    const week = getWeekOfYear(d);
    return { key: `${yyyy}-W${String(week).padStart(2, "0")}`, label: `Minggu ${week} ${yyyy}` };
  }

  if (mode === "bulanan") {
    return { key: `${yyyy}-${mm}`, label: `${mm}/${yyyy}` };
  }

  return { key: String(yyyy), label: String(yyyy) };
}

function includeRow(mode: BookingReportKey, row: BookingRecord): boolean {
  if (mode === "pembatalan") {
    return row.status === "Dibatalkan";
  }
  if (mode === "refund") {
    return row.status === "Refund";
  }
  if (mode === "no-show") {
    return row.status === "Dikonfirmasi";
  }
  return true;
}

export function buildBookingReport(rows: BookingRecord[], mode: BookingReportKey): Bucket[] {
  const grouped = new Map<string, Bucket>();

  for (const row of rows) {
    if (!includeRow(mode, row)) {
      continue;
    }

    const label = reportLabel(row, mode);
    const bucket = grouped.get(label.key) ?? createBucket(label.label, label.key);

    bucket.totalBooking += 1;
    bucket.totalOrang += Math.max(0, row.jumlahOrang);
    bucket.totalPendapatan += Math.max(0, Number(row.total || 0));

    grouped.set(label.key, bucket);
  }

  return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function buildBookingCsvReport(rows: BookingRecord[]): string {
  const columns = [
    "bookingNo",
    "namaPemesan",
    "pelanggan",
    "nomorHp",
    "email",
    "paketWisata",
    "tanggal",
    "jam",
    "jumlahOrang",
    "channel",
    "status",
    "pembayaran",
    "catatan",
    "total",
  ];

  const head = columns.join(",");
  const body = rows
    .map((row) => columns.map((key) => {
      if (key === "pembayaran") {
        const value = `${row.pembayaran.metode} (${row.pembayaran.status})`;
        return `"${value.replace(/"/g, '""')}"`;
      }
      const raw = String((row as unknown as Record<string, unknown>)[key] ?? "");
      return `"${raw.replace(/"/g, '""')}"`;
    }).join(","))
    .join("\n");

  return `${head}\n${body}`;
}

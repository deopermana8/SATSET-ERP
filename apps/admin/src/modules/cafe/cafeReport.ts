import type { CafeOrderRecord, CafeReportKey, CafeShiftRecord } from "./cafeTypes.js";

function weekOfYear(date: Date): number {
  const first = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date.getTime() - first.getTime()) / 86400000);
  return Math.ceil((day + first.getDay() + 1) / 7);
}

function bucketKey(order: CafeOrderRecord, mode: CafeReportKey): { key: string; label: string } {
  const d = new Date(order.dibuatPada);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  if (mode === "harian") return { key: `${yyyy}-${mm}-${dd}`, label: `${dd}/${mm}/${yyyy}` };
  if (mode === "mingguan") return { key: `${yyyy}-W${weekOfYear(d)}`, label: `Minggu ${weekOfYear(d)} ${yyyy}` };
  if (mode === "bulanan") return { key: `${yyyy}-${mm}`, label: `${mm}/${yyyy}` };
  if (mode === "tahunan") return { key: String(yyyy), label: String(yyyy) };
  if (mode === "per-menu") return { key: order.items[0]?.namaMenu || "-", label: order.items[0]?.namaMenu || "-" };
  if (mode === "per-kasir") return { key: order.kasir, label: order.kasir };
  if (mode === "per-pembayaran") return { key: order.pembayaran.metode, label: order.pembayaran.metode };
  if (mode === "per-pajak") return { key: "pajak", label: "Pajak" };
  if (mode === "per-diskon") return { key: "diskon", label: "Diskon" };
  return { key: order.status, label: order.status };
}

export function buildCafeReport(rows: CafeOrderRecord[], mode: CafeReportKey) {
  const map = new Map<string, { key: string; label: string; totalOrder: number; totalPenjualan: number }>();
  for (const row of rows) {
    const key = bucketKey(row, mode);
    const current = map.get(key.key) ?? { key: key.key, label: key.label, totalOrder: 0, totalPenjualan: 0 };
    current.totalOrder += 1;
    current.totalPenjualan += Number(row.total || 0);
    map.set(key.key, current);
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function buildCafeShiftReport(shifts: CafeShiftRecord[]) {
  return shifts.map((shift) => ({
    namaKasir: shift.namaKasir,
    modalAwal: shift.modalAwal,
    totalPenjualan: shift.totalPenjualan,
    totalTunai: shift.totalTunai,
    totalNonTunai: shift.totalNonTunai,
    selisihKas: shift.selisihKas,
    aktif: shift.aktif,
  }));
}

export function buildCafeCsvReport(rows: CafeOrderRecord[]): string {
  const columns = ["orderNo", "kasir", "status", "subtotal", "diskon", "pajak", "serviceCharge", "total"];
  const head = columns.join(",");
  const body = rows.map((row) => columns.map((key) => `"${String((row as unknown as Record<string, unknown>)[key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${head}\n${body}`;
}

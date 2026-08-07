import { defaultOutboundEquipment } from "./outboundEquipment.js";
import { defaultOutboundInstructors } from "./outboundInstructor.js";
import { calculateOutboundPrice } from "./outboundPricing.js";
import { buildScheduleStatus } from "./outboundSchedule.js";
import type { OutboundDashboardSummary, OutboundPackage, OutboundRecord } from "./outboundTypes.js";

export const defaultOutboundPackages: OutboundPackage[] = [
  { id: "ob-paket-team", namaPaket: "Team Building Pagi", kategori: "Team Building", harga: 85000, durasiMenit: 180, minimalPeserta: 10, maksimalPeserta: 60, lokasi: "Arena A", tingkatKesulitan: "Menengah", statusAktif: true },
  { id: "ob-paket-keluarga", namaPaket: "Outbound Keluarga", kategori: "Keluarga", harga: 65000, durasiMenit: 120, minimalPeserta: 4, maksimalPeserta: 25, lokasi: "Arena B", tingkatKesulitan: "Mudah", statusAktif: true },
  { id: "ob-paket-corporate", namaPaket: "Corporate Adventure", kategori: "Corporate", harga: 125000, durasiMenit: 240, minimalPeserta: 20, maksimalPeserta: 80, lokasi: "Arena C", tingkatKesulitan: "Tinggi", statusAktif: true },
];

export function createOutboundDraft(name = "Outbound Baru"): OutboundRecord {
  const paket = defaultOutboundPackages[0];
  const now = new Date();
  const id = `OB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getTime()).slice(-6)}`;
  const schedule = {
    id: `${id}-SCH`,
    paketId: paket.id,
    tanggal: now.toISOString().slice(0, 10),
    jamMulai: "08:00",
    jamSelesai: "11:00",
    slot: "Pagi",
    kuota: paket.maksimalPeserta,
    sisaKuota: paket.maksimalPeserta,
    bookingTerhubung: 0,
    status: buildScheduleStatus(paket.maksimalPeserta, paket.maksimalPeserta),
  };
  return {
    id,
    name,
    status: "Dijadwalkan",
    paket,
    jadwal: schedule,
    sesi: {
      id: `${id}-SES`,
      scheduleId: schedule.id,
      namaSesi: `${paket.namaPaket} ${schedule.slot}`,
      status: "Dijadwalkan",
      instructorIds: defaultOutboundInstructors.slice(0, 2).map((item) => item.id),
      equipmentIds: defaultOutboundEquipment.slice(0, 2).map((item) => item.id),
    },
    peserta: [],
    instruktur: defaultOutboundInstructors.slice(0, 2),
    peralatan: defaultOutboundEquipment.slice(0, 2),
    pembayaran: { metode: "Cash", nominal: 0 },
    voucher: null,
    pendapatan: 0,
    jurnalReferensi: `JRN-${id}`,
    dibuatPada: now.toISOString(),
    diperbaruiPada: now.toISOString(),
  };
}

export function summarizeOutboundDashboard(rows: OutboundRecord[]): OutboundDashboardSummary {
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = rows.filter((row) => row.jadwal.tanggal === today);
  const pesertaHariIni = todayRows.reduce((acc, row) => acc + row.peserta.length, 0);
  const pendapatanOutbound = todayRows.reduce((acc, row) => acc + Number(row.pendapatan || 0), 0);
  const kuotaTerpakai = todayRows.reduce((acc, row) => acc + Number(row.jadwal.bookingTerhubung || 0), 0);
  const kuotaTersisa = todayRows.reduce((acc, row) => acc + Number(row.jadwal.sisaKuota || 0), 0);
  const instrukturBertugas = new Set(todayRows.flatMap((row) => row.instruktur.map((item) => item.id))).size;
  const peralatanDipakai = todayRows.reduce((acc, row) => acc + row.peralatan.reduce((sum, item) => sum + Number(item.dipakai || 0), 0), 0);
  const hadir = todayRows.reduce((acc, row) => acc + row.peserta.filter((participant) => participant.statusHadir === "Hadir").length, 0);
  return {
    pesertaHariIni,
    sesiHariIni: todayRows.length,
    pendapatanOutbound,
    kuotaTerpakai,
    kuotaTersisa,
    instrukturBertugas,
    peralatanDipakai,
    tingkatKehadiran: pesertaHariIni ? Math.round((hadir / pesertaHariIni) * 100) : 0,
  };
}

export function recalculateOutboundTotals(record: OutboundRecord): OutboundRecord {
  const totals = calculateOutboundPrice(record.paket, record.peserta.length, record.voucher?.nilai || 0);
  return {
    ...record,
    pendapatan: totals.total,
    pembayaran: {
      ...record.pembayaran,
      nominal: totals.total,
    },
    diperbaruiPada: new Date().toISOString(),
  };
}

import type { OutboundSchedule, OutboundScheduleStatus } from "./outboundTypes.js";

export function buildScheduleStatus(kuota: number, sisaKuota: number, manual?: OutboundScheduleStatus): OutboundScheduleStatus {
  if (manual === "Dibatalkan") return "Dibatalkan";
  if (manual === "Ditutup") return "Ditutup";
  if (sisaKuota <= 0 || kuota <= 0) return "Penuh";
  return "Terbuka";
}

export function updateScheduleQuota(schedule: OutboundSchedule, pesertaBaru: number): OutboundSchedule {
  const bookingTerhubung = Math.max(0, Number(schedule.bookingTerhubung || 0) + Math.max(0, pesertaBaru));
  const sisaKuota = Math.max(0, Number(schedule.kuota || 0) - bookingTerhubung);
  return {
    ...schedule,
    bookingTerhubung,
    sisaKuota,
    status: buildScheduleStatus(schedule.kuota, sisaKuota, schedule.status),
  };
}

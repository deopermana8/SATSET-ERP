import type { OutboundParticipant, OutboundSchedule, OutboundValidationResult } from "./outboundTypes.js";

function result(issues: Array<{ field: string; message: string }>): OutboundValidationResult {
  return { ok: issues.length === 0, issues };
}

export function validateOverCapacity(schedule: OutboundSchedule, tambahanPeserta: number): OutboundValidationResult {
  const next = Number(schedule.bookingTerhubung || 0) + Math.max(0, tambahanPeserta);
  return next > Number(schedule.kuota || 0)
    ? result([{ field: "kuota", message: "Peserta melebihi kapasitas" }])
    : result([]);
}

export function validateDuplicateParticipant(participants: OutboundParticipant[], bookingNo: string, nama: string): OutboundValidationResult {
  const duplicate = participants.some((participant) => participant.bookingNo === bookingNo || participant.nama.toLowerCase() === String(nama || "").toLowerCase());
  return duplicate ? result([{ field: "peserta", message: "Peserta duplikat" }]) : result([]);
}

export function validateDuplicateScan(scans: Array<{ ticketNo: string }>, ticketNo: string): OutboundValidationResult {
  return scans.some((scan) => scan.ticketNo === ticketNo)
    ? result([{ field: "scan", message: "Tiket sudah pernah discan" }])
    : result([]);
}

export function validateTicketState(status: string): OutboundValidationResult {
  if (status === "Kadaluarsa") return result([{ field: "ticket", message: "Tiket kadaluarsa" }]);
  if (status === "Refund") return result([{ field: "ticket", message: "Tiket refund" }]);
  if (status === "Void") return result([{ field: "ticket", message: "Tiket void" }]);
  return result([]);
}

export function validateCancelledBooking(status: string): OutboundValidationResult {
  return status === "Dibatalkan" ? result([{ field: "booking", message: "Booking dibatalkan" }]) : result([]);
}

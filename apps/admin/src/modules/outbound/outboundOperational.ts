import { createAttendanceRecord } from "./outboundAttendance.js";
import { attachTicketToParticipant, createParticipantFromBooking, markParticipantAttendance } from "./outboundParticipant.js";
import { calculateOutboundPrice } from "./outboundPricing.js";
import { updateScheduleQuota } from "./outboundSchedule.js";
import { validateCancelledBooking, validateDuplicateParticipant, validateDuplicateScan, validateOverCapacity, validateTicketState } from "./outboundValidator.js";
import type { BookingRecord } from "../booking/bookingTypes.js";
import type { TicketRecord } from "../ticketing/ticketingTypes.js";
import type { OutboundParticipant, OutboundRecord, OutboundSchedule } from "./outboundTypes.js";

export function canCreateParticipantFromBooking(record: BookingRecord): boolean {
  const source = `${record.name || ""} ${record.paketWisata || ""}`.toLowerCase();
  return record.status === "Dikonfirmasi" && source.includes("outbound");
}

export function addParticipantFromBooking(current: OutboundParticipant[], booking: BookingRecord, schedule: OutboundSchedule) {
  const duplicate = validateDuplicateParticipant(current, booking.bookingNo, booking.namaPemesan || booking.name);
  const cancelled = validateCancelledBooking(booking.status);
  const capacity = validateOverCapacity(schedule, Math.max(1, Number(booking.jumlahOrang || 1)));
  if (!duplicate.ok || !cancelled.ok || !capacity.ok) {
    return { ok: false, participant: null, schedule, issues: [...duplicate.issues, ...cancelled.issues, ...capacity.issues] };
  }
  const participant = createParticipantFromBooking(booking, schedule.id);
  const nextSchedule = updateScheduleQuota(schedule, Math.max(1, Number(booking.jumlahOrang || 1)));
  return { ok: true, participant, schedule: nextSchedule, issues: [] };
}

export function checkInOutboundParticipant(record: OutboundRecord, ticket: TicketRecord, gate: string, petugas: string, scans: Array<{ ticketNo: string }>) {
  const duplicateScan = validateDuplicateScan(scans, ticket.ticketNo);
  const ticketState = validateTicketState(ticket.status);
  if (!duplicateScan.ok || !ticketState.ok) {
    return { ok: false, issues: [...duplicateScan.issues, ...ticketState.issues], record, attendance: null };
  }
  const participant = record.peserta.find((item) => item.bookingNo === ticket.bookingNo || item.ticketNo === ticket.ticketNo);
  if (!participant) {
    return { ok: false, issues: [{ field: "peserta", message: "Peserta outbound tidak ditemukan" }], record, attendance: null };
  }
  const updatedParticipant = markParticipantAttendance(attachTicketToParticipant(participant, ticket), "Hadir");
  const attendance = createAttendanceRecord(updatedParticipant, gate, petugas);
  return {
    ok: true,
    issues: [],
    attendance,
    record: {
      ...record,
      peserta: record.peserta.map((item) => item.id === participant.id ? updatedParticipant : item),
      diperbaruiPada: new Date().toISOString(),
    },
  };
}

export function buildOutboundVoucherForCafe(record: OutboundRecord) {
  return {
    kode: `CAF-${record.id}`,
    nilai: Math.round(record.pendapatan * 0.05),
    dipakai: false,
  };
}

export function buildOutboundJournalMetadata(record: OutboundRecord) {
  return {
    referensi: record.id,
    sumber: "outbound",
    nominal: record.pembayaran.nominal,
    metode: record.pembayaran.metode,
  };
}

export function recalculateOutboundRevenue(record: OutboundRecord): OutboundRecord {
  const pricing = calculateOutboundPrice(record.paket, record.peserta.length, record.voucher?.nilai || 0);
  return {
    ...record,
    pendapatan: pricing.total,
    pembayaran: {
      ...record.pembayaran,
      nominal: pricing.total,
    },
    diperbaruiPada: new Date().toISOString(),
  };
}

import type { BookingRecord } from "../booking/bookingTypes.js";
import type { TicketRecord } from "../ticketing/ticketingTypes.js";
import type { OutboundAttendanceStatus, OutboundParticipant } from "./outboundTypes.js";

export function generateParticipantNo(now = new Date()): string {
  return `PST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getTime()).slice(-5)}`;
}

export function createParticipantFromBooking(booking: BookingRecord, scheduleId: string, grup = "Umum"): OutboundParticipant {
  return {
    id: generateParticipantNo(),
    nomorPeserta: generateParticipantNo(),
    nama: booking.namaPemesan || booking.name,
    bookingNo: booking.bookingNo,
    ticketNo: "",
    grup,
    kontak: booking.nomorHp || "",
    statusHadir: "Belum Hadir",
    scheduleId,
    voucherMakan: `MKN-${booking.bookingNo}`,
    promoCafe: "Promo Peserta Outbound",
  };
}

export function attachTicketToParticipant(participant: OutboundParticipant, ticket: TicketRecord): OutboundParticipant {
  return {
    ...participant,
    ticketNo: ticket.ticketNo,
  };
}

export function markParticipantAttendance(participant: OutboundParticipant, status: OutboundAttendanceStatus): OutboundParticipant {
  return {
    ...participant,
    statusHadir: status,
  };
}

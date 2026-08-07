import { buildBarcode, buildQrCode, toTicketRecord } from "../ticketing/ticketingEngine.js";
import type { TicketRecord } from "../ticketing/ticketingTypes.js";
import type {
  BookingIntegrationPorts,
  BookingRecord,
  BookingSummary,
} from "./bookingTypes.js";

export type OperasionalEventType =
  | "Booking dibuat"
  | "Pembayaran"
  | "Tiket dibuat"
  | "Scan masuk"
  | "Selesai";

export type OperasionalTimelineItem = {
  title: OperasionalEventType;
  bookingNo: string;
  ticketNo?: string;
  gate?: string;
  petugas?: string;
  at: string;
};

export type OperasionalNotifikasi = {
  kategori: "info" | "success" | "warning" | "error";
  judul: string;
  deskripsi: string;
  at: string;
};

export type OperasionalCheckInStatus = "Menunggu" | "Dipanggil" | "Selesai";

export type OperasionalCheckInItem = {
  bookingNo: string;
  pelanggan: string;
  status: OperasionalCheckInStatus;
  createdAt: string;
  updatedAt: string;
};

export type GateMonitoringSummary = {
  jumlahScan: number;
  scanBerhasil: number;
  scanGagal: number;
  tiketVoid: number;
  tiketRefund: number;
};

export type TicketScanValidation = {
  ok: boolean;
  reason: string;
};

export function createTicketFromBooking(booking: BookingRecord): TicketRecord {
  const base = toTicketRecord({
    name: `Tiket Booking ${booking.bookingNo}`,
    status: "Belum Digunakan",
    channel: booking.channel === "Offline" ? "Offline" : "Online",
    paymentMethod: booking.pembayaran.metode === "Cash" ? "Tunai" : "Transfer",
    amount: booking.subtotal,
    discount: booking.diskon,
    tax: booking.pajak,
    total: booking.total,
  });

  return {
    ...base,
    name: `Tiket Booking ${booking.bookingNo}`,
    qrCode: buildQrCode(base.ticketNo),
    barcode: buildBarcode(base.ticketNo),
  };
}

export function validateTicketForScan(ticket: TicketRecord, nowIso = new Date().toISOString()): TicketScanValidation {
  if (!ticket.ticketNo) {
    return { ok: false, reason: "Tiket tidak valid" };
  }
  if (ticket.status === "Sudah Digunakan") {
    return { ok: false, reason: "Tiket sudah digunakan" };
  }
  if (ticket.status === "Refund") {
    return { ok: false, reason: "Tiket refund" };
  }
  if (ticket.status === "Void") {
    return { ok: false, reason: "Tiket void" };
  }
  if (ticket.status === "Kadaluarsa" || ticket.expiredAt < nowIso) {
    return { ok: false, reason: "Tiket kadaluarsa" };
  }
  return { ok: true, reason: "OK" };
}

export function summarizeGateMonitoring(scanRows: Array<{ result: string; reason?: string }>): GateMonitoringSummary {
  return scanRows.reduce<GateMonitoringSummary>((acc, row) => {
    acc.jumlahScan += 1;
    if (row.result === "valid") {
      acc.scanBerhasil += 1;
    } else {
      acc.scanGagal += 1;
    }
    if (row.reason === "Tiket void") {
      acc.tiketVoid += 1;
    }
    if (row.reason === "Tiket refund") {
      acc.tiketRefund += 1;
    }
    return acc;
  }, {
    jumlahScan: 0,
    scanBerhasil: 0,
    scanGagal: 0,
    tiketVoid: 0,
    tiketRefund: 0,
  });
}

export function toOperasionalSummary(input: {
  booking: BookingSummary;
  tiketTerjual: number;
  tiketDigunakan: number;
  pendapatan: number;
  cafe: number;
  outbound: number;
}) {
  return [
    { key: "booking", label: "Booking", value: input.booking.bookingHariIni },
    { key: "tiket-terjual", label: "Tiket Terjual", value: input.tiketTerjual },
    { key: "tiket-digunakan", label: "Tiket Digunakan", value: input.tiketDigunakan },
    { key: "pendapatan", label: "Pendapatan", value: input.pendapatan },
    { key: "cafe", label: "Cafe", value: input.cafe },
    { key: "outbound", label: "Outbound", value: input.outbound },
  ] as const;
}

export function createOperasionalNotification(kategori: OperasionalNotifikasi["kategori"], judul: string, deskripsi: string): OperasionalNotifikasi {
  return {
    kategori,
    judul,
    deskripsi,
    at: new Date().toISOString(),
  };
}

export function buildOperasionalTimeline(items: OperasionalTimelineItem[]): OperasionalTimelineItem[] {
  return items
    .slice()
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function createBookingIntegrationPortsAdapter(ports: Partial<BookingIntegrationPorts>): BookingIntegrationPorts {
  return {
    ticketing: {
      createTicketFromBooking: ports.ticketing?.createTicketFromBooking ?? (async () => null),
    },
    cafe: {
      createPreOrderFromBooking: ports.cafe?.createPreOrderFromBooking ?? (async () => null),
    },
    outbound: {
      reserveOutboundSlot: ports.outbound?.reserveOutboundSlot ?? (async () => null),
    },
    keuangan: {
      postPaymentJournal: ports.keuangan?.postPaymentJournal ?? (async () => null),
    },
    akuntansi: {
      postRevenueRecognition: ports.akuntansi?.postRevenueRecognition ?? (async () => null),
    },
    barcode: {
      createBarcode: ports.barcode?.createBarcode ?? ((bookingNo) => `BAR:${bookingNo}`),
    },
    qrTicket: {
      createQrTicket: ports.qrTicket?.createQrTicket ?? ((bookingNo) => `QR:${bookingNo}`),
    },
    absensi: {
      checkIn: ports.absensi?.checkIn ?? (async () => null),
    },
  };
}

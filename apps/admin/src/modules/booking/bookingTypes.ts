export const bookingStatuses = [
  "Draft",
  "Menunggu Pembayaran",
  "Dibayar",
  "Dikonfirmasi",
  "Check In",
  "Selesai",
  "Dibatalkan",
  "Refund",
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export const bookingTypes = [
  "Perorangan",
  "Keluarga",
  "Rombongan",
  "Sekolah",
  "Instansi",
  "Corporate",
  "Travel Agent",
  "Online",
  "Offline",
] as const;

export type BookingType = (typeof bookingTypes)[number];

export const bookingPaymentMethods = ["Cash", "QRIS", "Transfer", "Virtual Account", "EDC"] as const;

export type BookingPaymentMethod = (typeof bookingPaymentMethods)[number];

export type BookingChannel = "Online" | "Offline" | "Travel Agent" | "Corporate" | "Instansi";

export type BookingPriceTag = "weekday" | "weekend" | "hari-libur" | "musiman" | "promo" | "voucher" | "diskon";

export type BookingPricingRule = {
  id: string;
  paketWisata: string;
  tag: BookingPriceTag;
  amount: number;
  percent: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
};

export type BookingQuota = {
  kapasitas: number;
  sisaKuota: number;
  bookingAktif: number;
  waitingList: number;
};

export type BookingPayment = {
  metode: BookingPaymentMethod;
  status: "Belum Dibayar" | "Sebagian" | "Lunas" | "Refund";
  nominal: number;
  referensi?: string;
};

export type BookingRecord = {
  id: string;
  name: string;
  status: BookingStatus;
  bookingNo: string;
  namaPemesan: string;
  pelanggan: string;
  nomorHp: string;
  email: string;
  paketWisata: string;
  tanggal: string;
  jam: string;
  jumlahOrang: number;
  tipeBooking: BookingType;
  channel: BookingChannel;
  pembayaran: BookingPayment;
  catatan: string;
  kuota: BookingQuota;
  subtotal: number;
  diskon: number;
  pajak: number;
  total: number;
  dibuatPada: string;
  diperbaruiPada: string;
};

export type BookingValidationIssue = {
  field: string;
  message: string;
};

export type BookingValidationResult = {
  ok: boolean;
  issues: BookingValidationIssue[];
};

export type BookingSummary = {
  bookingHariIni: number;
  bookingMingguIni: number;
  bookingBulanIni: number;
  pendapatanBooking: number;
  kuotaTerisi: number;
  kuotaTersedia: number;
  paketTerlaris: string;
  channelTerlaris: string;
};

export type BookingReportKey =
  | "harian"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "pembatalan"
  | "refund"
  | "no-show"
  | "occupancy";

export type BookingCalendarDay = {
  date: string;
  totalBooking: number;
  totalOrang: number;
  kapasitas: number;
  terisi: number;
  tersedia: number;
  waitingList: number;
  occupancyPercent: number;
};

export type BookingCalendarView = {
  from: string;
  to: string;
  days: BookingCalendarDay[];
};

export type BookingIntegrationPorts = {
  ticketing: {
    createTicketFromBooking: (booking: BookingRecord) => Promise<{ ticketNo: string } | null>;
  };
  cafe: {
    createPreOrderFromBooking: (booking: BookingRecord) => Promise<{ orderNo: string } | null>;
  };
  outbound: {
    reserveOutboundSlot: (booking: BookingRecord) => Promise<{ slotId: string } | null>;
  };
  keuangan: {
    postPaymentJournal: (booking: BookingRecord) => Promise<{ journalNo: string } | null>;
  };
  akuntansi: {
    postRevenueRecognition: (booking: BookingRecord) => Promise<{ entryNo: string } | null>;
  };
  barcode: {
    createBarcode: (bookingNo: string) => string;
  };
  qrTicket: {
    createQrTicket: (bookingNo: string) => string;
  };
  absensi: {
    checkIn: (bookingNo: string, jumlahOrang: number) => Promise<{ hadir: number } | null>;
  };
};

export type BookingGateway = {
  requestPayment: (payload: {
    bookingNo: string;
    metode: BookingPaymentMethod;
    nominal: number;
  }) => Promise<{ reference: string; status: "PENDING" | "SUCCESS" | "FAILED" }>;
};

export const bookingDashboardWidgets = [
  "Booking Hari Ini",
  "Booking Minggu Ini",
  "Booking Bulan Ini",
  "Pendapatan Booking",
  "Kuota Terisi",
  "Kuota Tersedia",
  "Paket Terlaris",
  "Channel Terlaris",
] as const;

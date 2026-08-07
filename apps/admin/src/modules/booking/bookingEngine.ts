import { generateBookingNo } from "./bookingNumber.js";
import { canTransitionBookingStatus } from "./bookingStatus.js";
import type { BookingChannel, BookingRecord, BookingSummary, BookingType } from "./bookingTypes.js";

const defaultType: BookingType = "Perorangan";
const defaultChannel: BookingChannel = "Offline";

export function createBookingRecord(input: Partial<BookingRecord>): BookingRecord {
  const bookingNo = input.bookingNo || generateBookingNo();
  const now = new Date().toISOString();

  return {
    id: input.id || bookingNo,
    name: input.name || `Booking ${bookingNo}`,
    status: input.status || "Draft",
    bookingNo,
    namaPemesan: input.namaPemesan || "",
    pelanggan: input.pelanggan || "",
    nomorHp: input.nomorHp || "",
    email: input.email || "",
    paketWisata: input.paketWisata || "",
    tanggal: input.tanggal || now.slice(0, 10),
    jam: input.jam || "08:00",
    jumlahOrang: Math.max(0, Number(input.jumlahOrang || 0)),
    tipeBooking: input.tipeBooking || defaultType,
    channel: input.channel || defaultChannel,
    pembayaran: input.pembayaran || {
      metode: "Cash",
      status: "Belum Dibayar",
      nominal: 0,
    },
    catatan: input.catatan || "",
    kuota: input.kuota || {
      kapasitas: 0,
      sisaKuota: 0,
      bookingAktif: 0,
      waitingList: 0,
    },
    subtotal: Number(input.subtotal || 0),
    diskon: Number(input.diskon || 0),
    pajak: Number(input.pajak || 0),
    total: Number(input.total || 0),
    dibuatPada: input.dibuatPada || now,
    diperbaruiPada: input.diperbaruiPada || now,
  };
}

export function recalculateQuota(record: BookingRecord, kapasitas: number, totalAktif: number): BookingRecord {
  const bookingAktif = Math.max(0, totalAktif);
  const sisaKuota = Math.max(0, kapasitas - bookingAktif);
  const waitingList = Math.max(0, bookingAktif - kapasitas);

  return {
    ...record,
    kuota: {
      kapasitas,
      sisaKuota,
      bookingAktif,
      waitingList,
    },
  };
}

export function recalculateBookingTotals(
  record: BookingRecord,
  pricing: {
    subtotal: number;
    diskon: number;
    pajak: number;
    total: number;
  },
): BookingRecord {
  return {
    ...record,
    subtotal: pricing.subtotal,
    diskon: pricing.diskon,
    pajak: pricing.pajak,
    total: pricing.total,
    diperbaruiPada: new Date().toISOString(),
  };
}

export function applyBookingStatus(record: BookingRecord, nextStatus: BookingRecord["status"]): BookingRecord {
  if (!canTransitionBookingStatus(record.status, nextStatus)) {
    return record;
  }
  return {
    ...record,
    status: nextStatus,
    diperbaruiPada: new Date().toISOString(),
  };
}

export function buildBookingSummary(rows: BookingRecord[]): BookingSummary {
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = new Date(dayStart);
  weekStart.setDate(dayStart.getDate() - dayStart.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const paketMap = new Map<string, number>();
  const channelMap = new Map<string, number>();

  let bookingHariIni = 0;
  let bookingMingguIni = 0;
  let bookingBulanIni = 0;
  let pendapatanBooking = 0;
  let kuotaTerisi = 0;
  let kuotaTersedia = 0;

  for (const row of rows) {
    const bookingDate = new Date(`${row.tanggal.slice(0, 10)}T00:00:00`);
    if (bookingDate >= dayStart) {
      bookingHariIni += 1;
    }
    if (bookingDate >= weekStart) {
      bookingMingguIni += 1;
    }
    if (bookingDate >= monthStart) {
      bookingBulanIni += 1;
    }

    pendapatanBooking += Number(row.total || 0);
    kuotaTerisi += Math.max(0, row.kuota.bookingAktif);
    kuotaTersedia += Math.max(0, row.kuota.sisaKuota);

    paketMap.set(row.paketWisata, (paketMap.get(row.paketWisata) || 0) + 1);
    channelMap.set(row.channel, (channelMap.get(row.channel) || 0) + 1);
  }

  const paketTerlaris = Array.from(paketMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const channelTerlaris = Array.from(channelMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return {
    bookingHariIni,
    bookingMingguIni,
    bookingBulanIni,
    pendapatanBooking,
    kuotaTerisi,
    kuotaTersedia,
    paketTerlaris,
    channelTerlaris,
  };
}

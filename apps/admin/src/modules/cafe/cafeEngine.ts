import { buildCafeFinancialJournal } from "./cafePayment.js";
import { createCafeOrderDraft, recalculateCafeOrder } from "./cafeOrder.js";
import { deriveKitchenPriority, estimateKitchenTime } from "./cafeKitchen.js";
import type { BookingRecord } from "../booking/bookingTypes.js";
import type { TicketRecord } from "../ticketing/ticketingTypes.js";
import type { CafeDashboardSummary, CafeMenuItem, CafeOrderRecord, CafeShiftRecord } from "./cafeTypes.js";

export const defaultCafeMenus: CafeMenuItem[] = [
  { id: "menu-nasi-goreng", kodeMenu: "MKN-001", barcode: "MKN001", qr: "QR:MKN001", namaMenu: "Nasi Goreng", kategori: "Makanan", harga: 28000, pajakPercent: 11, serviceChargePercent: 5, diskonPercent: 0, status: "Aktif", foto: "", stok: 120, satuan: "Porsi" },
  { id: "menu-mie-goreng", kodeMenu: "MKN-002", barcode: "MKN002", qr: "QR:MKN002", namaMenu: "Mie Goreng", kategori: "Makanan", harga: 26000, pajakPercent: 11, serviceChargePercent: 5, diskonPercent: 0, status: "Aktif", foto: "", stok: 90, satuan: "Porsi" },
  { id: "menu-es-teh", kodeMenu: "MNM-001", barcode: "MNM001", qr: "QR:MNM001", namaMenu: "Es Teh", kategori: "Minuman", harga: 8000, pajakPercent: 11, serviceChargePercent: 5, diskonPercent: 0, status: "Aktif", foto: "", stok: 200, satuan: "Gelas" },
  { id: "menu-kopi-susu", kodeMenu: "MNM-002", barcode: "MNM002", qr: "QR:MNM002", namaMenu: "Kopi Susu", kategori: "Minuman", harga: 18000, pajakPercent: 11, serviceChargePercent: 5, diskonPercent: 0, status: "Aktif", foto: "", stok: 140, satuan: "Gelas" },
  { id: "menu-paket-keluarga", kodeMenu: "PKT-001", barcode: "PKT001", qr: "QR:PKT001", namaMenu: "Paket Keluarga", kategori: "Paket", harga: 95000, pajakPercent: 11, serviceChargePercent: 5, diskonPercent: 10, status: "Aktif", foto: "", stok: 40, satuan: "Set" },
];

export function createCafeOrderFromBooking(booking: BookingRecord, kasir: string): CafeOrderRecord {
  const draft = createCafeOrderDraft(kasir);
  draft.booking = {
    bookingNo: booking.bookingNo,
    namaPemesan: booking.namaPemesan,
    jumlahOrang: booking.jumlahOrang,
    paket: booking.paketWisata,
    jadwal: `${booking.tanggal} ${booking.jam}`,
    catatan: booking.catatan,
  };
  draft.name = `Pesanan Booking ${booking.bookingNo}`;
  draft.kitchen.prioritas = "Tinggi";
  return draft;
}

export function attachTicketToCafeOrder(order: CafeOrderRecord, ticket: TicketRecord): CafeOrderRecord {
  return {
    ...order,
    tiket: {
      ticketNo: ticket.ticketNo,
      namaPengunjung: ticket.name,
      jenisTiket: ticket.tariffType,
      jumlahOrang: 1,
      promo: "",
      voucher: "",
      diskon: ticket.discount,
    },
  };
}

export function enrichCafeKitchen(order: CafeOrderRecord): CafeOrderRecord {
  return {
    ...recalculateCafeOrder(order),
    kitchen: {
      ...order.kitchen,
      estimasiMenit: estimateKitchenTime(order),
      prioritas: deriveKitchenPriority(order),
    },
  };
}

export function buildCafeDashboardSummary(rows: CafeOrderRecord[], shifts: CafeShiftRecord[]): CafeDashboardSummary {
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = rows.filter((row) => row.dibuatPada.slice(0, 10) === today);
  const menuMap = new Map<string, number>();
  const jamMap = new Map<string, number>();
  let pendapatan = 0;
  let orderDiproses = 0;
  let orderSelesai = 0;
  for (const row of todayRows) {
    pendapatan += Number(row.total || 0);
    if (row.kitchen.status === "Diproses") orderDiproses += 1;
    if (row.kitchen.status === "Selesai") orderSelesai += 1;
    jamMap.set(row.dibuatPada.slice(11, 13), (jamMap.get(row.dibuatPada.slice(11, 13)) || 0) + 1);
    row.items.forEach((item) => menuMap.set(item.namaMenu, (menuMap.get(item.namaMenu) || 0) + item.qty));
  }
  const menuTerlaris = Array.from(menuMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const jamRamaiKey = Array.from(jamMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "00";
  const shiftAktif = shifts.find((shift) => shift.aktif);
  return {
    pendapatanCafeHariIni: pendapatan,
    totalOrderHariIni: todayRows.length,
    menuTerlaris,
    produkTerlaris: menuTerlaris,
    jamRamai: `${jamRamaiKey}:00`,
    orderDiproses,
    orderSelesai,
    nilaiRataRataTransaksi: todayRows.length ? pendapatan / todayRows.length : 0,
    kasAktif: shiftAktif ? shiftAktif.modalAwal + shiftAktif.totalTunai : 0,
  };
}

export function buildCafeJournal(order: CafeOrderRecord) {
  return buildCafeFinancialJournal(order);
}

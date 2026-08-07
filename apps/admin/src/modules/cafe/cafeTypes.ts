export const cafeMenuCategories = ["Makanan", "Minuman", "Snack", "Paket", "Promo"] as const;
export type CafeMenuCategory = (typeof cafeMenuCategories)[number];

export const cafeMenuStatuses = ["Aktif", "Nonaktif", "Habis"] as const;
export type CafeMenuStatus = (typeof cafeMenuStatuses)[number];

export const cafeOrderStatuses = ["Draft", "Hold", "Dibayar", "Void", "Refund"] as const;
export type CafeOrderStatus = (typeof cafeOrderStatuses)[number];

export const cafeKitchenStatuses = ["Menunggu", "Diproses", "Siap", "Diantar", "Selesai", "Batal"] as const;
export type CafeKitchenStatus = (typeof cafeKitchenStatuses)[number];

export const cafePaymentMethods = ["Tunai", "QRIS", "Transfer", "Debit", "Kredit", "EDC", "Voucher", "Complimentary"] as const;
export type CafePaymentMethod = (typeof cafePaymentMethods)[number];

export const cafeUnits = ["Porsi", "Gelas", "Botol", "Kotak", "Set"] as const;
export type CafeUnit = (typeof cafeUnits)[number];

export type CafeMenuItem = {
  id: string;
  kodeMenu: string;
  barcode: string;
  qr: string;
  namaMenu: string;
  kategori: CafeMenuCategory;
  harga: number;
  pajakPercent: number;
  serviceChargePercent: number;
  diskonPercent: number;
  status: CafeMenuStatus;
  foto: string;
  stok: number;
  satuan: CafeUnit;
};

export type CafeOrderItem = {
  id: string;
  menuId: string;
  kodeMenu: string;
  namaMenu: string;
  qty: number;
  harga: number;
  pajakPercent: number;
  serviceChargePercent: number;
  diskonPercent: number;
  catatan: string;
  subtotal: number;
  diskon: number;
  pajak: number;
  serviceCharge: number;
  total: number;
};

export type CafeBookingSnapshot = {
  bookingNo: string;
  namaPemesan: string;
  jumlahOrang: number;
  paket: string;
  jadwal: string;
  catatan: string;
};

export type CafeTicketSnapshot = {
  ticketNo: string;
  namaPengunjung: string;
  jenisTiket: string;
  jumlahOrang: number;
  promo: string;
  voucher: string;
  diskon: number;
};

export type CafeKitchenTicket = {
  nomorAntrian: string;
  status: CafeKitchenStatus;
  estimasiMenit: number;
  prioritas: "Rendah" | "Normal" | "Tinggi";
  riwayatStatus: Array<{ status: CafeKitchenStatus; at: string }>;
};

export type CafePaymentSummary = {
  metode: CafePaymentMethod;
  dibayar: number;
  pembulatan: number;
  kembalian: number;
  referensi?: string;
};

export type CafeOrderRecord = {
  id: string;
  name: string;
  status: CafeOrderStatus;
  orderNo: string;
  kasir: string;
  meja: string;
  items: CafeOrderItem[];
  booking?: CafeBookingSnapshot;
  tiket?: CafeTicketSnapshot;
  pembayaran: CafePaymentSummary;
  kitchen: CafeKitchenTicket;
  subtotal: number;
  diskon: number;
  pajak: number;
  serviceCharge: number;
  pembulatan: number;
  total: number;
  catatan: string;
  dibuatPada: string;
  diperbaruiPada: string;
};

export type CafeShiftRecord = {
  id: string;
  namaKasir: string;
  modalAwal: number;
  jamBuka: string;
  jamTutup?: string;
  totalPenjualan: number;
  totalTunai: number;
  totalNonTunai: number;
  selisihKas: number;
  ringkasanShift: string;
  aktif: boolean;
};

export type CafeValidationIssue = {
  field: string;
  message: string;
};

export type CafeValidationResult = {
  ok: boolean;
  issues: CafeValidationIssue[];
};

export type CafeDashboardSummary = {
  pendapatanCafeHariIni: number;
  totalOrderHariIni: number;
  menuTerlaris: string;
  produkTerlaris: string;
  jamRamai: string;
  orderDiproses: number;
  orderSelesai: number;
  nilaiRataRataTransaksi: number;
  kasAktif: number;
};

export type CafeReportKey =
  | "harian"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "per-menu"
  | "per-kategori"
  | "per-kasir"
  | "per-shift"
  | "per-pembayaran"
  | "per-pajak"
  | "per-diskon";

export type CafeFinancialAdapterConfig = {
  debitKas: string;
  debitQris: string;
  debitPiutang: string;
  kreditPendapatan: string;
  kreditPajak: string;
  kreditServiceCharge: string;
};

export type CafeFinancialJournalLine = {
  akun: string;
  posisi: "Debit" | "Kredit";
  nominal: number;
};

export type CafeFinancialJournal = {
  referensi: string;
  keterangan: string;
  lines: CafeFinancialJournalLine[];
};

export const cafeDashboardWidgetLabels = [
  "Pendapatan Cafe Hari Ini",
  "Total Order Hari Ini",
  "Menu Terlaris",
  "Produk Terlaris",
  "Jam Ramai",
  "Order Diproses",
  "Order Selesai",
  "Nilai Rata-rata Transaksi",
  "Kas Aktif",
] as const;

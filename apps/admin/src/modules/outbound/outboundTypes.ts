export const outboundPackageCategories = ["Team Building", "Petualangan", "Edukasi", "Keluarga", "Corporate"] as const;
export type OutboundPackageCategory = (typeof outboundPackageCategories)[number];

export const outboundDifficultyLevels = ["Mudah", "Menengah", "Tinggi", "Ekstrem"] as const;
export type OutboundDifficultyLevel = (typeof outboundDifficultyLevels)[number];

export const outboundScheduleStatuses = ["Terbuka", "Penuh", "Ditutup", "Dibatalkan"] as const;
export type OutboundScheduleStatus = (typeof outboundScheduleStatuses)[number];

export const outboundAttendanceStatuses = ["Hadir", "Belum Hadir", "Terlambat", "Tidak Hadir"] as const;
export type OutboundAttendanceStatus = (typeof outboundAttendanceStatuses)[number];

export const outboundSessionStatuses = ["Dijadwalkan", "Persiapan", "Berlangsung", "Selesai", "Dibatalkan"] as const;
export type OutboundSessionStatus = (typeof outboundSessionStatuses)[number];

export const outboundPaymentMethods = ["Cash", "QRIS", "Transfer", "VA", "EDC"] as const;
export type OutboundPaymentMethod = (typeof outboundPaymentMethods)[number];

export type OutboundPackage = {
  id: string;
  namaPaket: string;
  kategori: OutboundPackageCategory;
  harga: number;
  durasiMenit: number;
  minimalPeserta: number;
  maksimalPeserta: number;
  lokasi: string;
  tingkatKesulitan: OutboundDifficultyLevel;
  statusAktif: boolean;
};

export type OutboundSchedule = {
  id: string;
  paketId: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  slot: string;
  kuota: number;
  sisaKuota: number;
  bookingTerhubung: number;
  status: OutboundScheduleStatus;
};

export type OutboundParticipant = {
  id: string;
  nomorPeserta: string;
  nama: string;
  bookingNo: string;
  ticketNo: string;
  grup: string;
  kontak: string;
  statusHadir: OutboundAttendanceStatus;
  scheduleId: string;
  voucherMakan: string;
  promoCafe: string;
};

export type OutboundInstructor = {
  id: string;
  nama: string;
  sertifikasi: string;
  shift: string;
  status: "Aktif" | "Siaga" | "Libur";
};

export type OutboundEquipment = {
  id: string;
  nama: string;
  stok: number;
  dipakai: number;
  rusak: number;
  maintenance: number;
};

export type OutboundAttendanceRecord = {
  id: string;
  participantId: string;
  scheduleId: string;
  status: OutboundAttendanceStatus;
  checkedInAt?: string;
  gate?: string;
  petugas?: string;
};

export type OutboundSession = {
  id: string;
  scheduleId: string;
  namaSesi: string;
  status: OutboundSessionStatus;
  instructorIds: string[];
  equipmentIds: string[];
  startedAt?: string;
  endedAt?: string;
};

export type OutboundPayment = {
  metode: OutboundPaymentMethod;
  nominal: number;
  referensi?: string;
};

export type OutboundVoucher = {
  kode: string;
  nilai: number;
  dipakai: boolean;
};

export type OutboundRecord = {
  id: string;
  name: string;
  status: OutboundSessionStatus;
  paket: OutboundPackage;
  jadwal: OutboundSchedule;
  sesi: OutboundSession;
  peserta: OutboundParticipant[];
  instruktur: OutboundInstructor[];
  peralatan: OutboundEquipment[];
  pembayaran: OutboundPayment;
  voucher: OutboundVoucher | null;
  pendapatan: number;
  jurnalReferensi: string;
  dibuatPada: string;
  diperbaruiPada: string;
};

export type OutboundValidationIssue = {
  field: string;
  message: string;
};

export type OutboundValidationResult = {
  ok: boolean;
  issues: OutboundValidationIssue[];
};

export type OutboundDashboardSummary = {
  pesertaHariIni: number;
  sesiHariIni: number;
  pendapatanOutbound: number;
  kuotaTerpakai: number;
  kuotaTersisa: number;
  instrukturBertugas: number;
  peralatanDipakai: number;
  tingkatKehadiran: number;
};

export type OutboundReportKey = "peserta" | "pendapatan" | "instruktur" | "kehadiran" | "jadwal" | "peralatan" | "voucher" | "pembayaran";

export type OutboundFinancialJournalLine = {
  akun: string;
  posisi: "Debit" | "Kredit";
  nominal: number;
};

export type OutboundFinancialJournal = {
  referensi: string;
  keterangan: string;
  lines: OutboundFinancialJournalLine[];
};

export type OutboundFinancialAdapterConfig = {
  debitKas: string;
  debitQris: string;
  debitPiutang: string;
  kreditPendapatan: string;
};

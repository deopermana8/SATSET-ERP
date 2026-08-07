export const financeCashAccountNames = ["Kas Utama", "Kas Loket", "Kas Cafe", "Kas Outbound"] as const;
export type FinanceCashAccountName = (typeof financeCashAccountNames)[number];

export const financeTransactionTypes = ["Pemasukan", "Pengeluaran", "Transfer", "Refund", "Penyesuaian"] as const;
export type FinanceTransactionType = (typeof financeTransactionTypes)[number];

export const financeTransactionSources = ["Ticketing", "Booking", "Cafe", "Outbound", "Manual"] as const;
export type FinanceTransactionSource = (typeof financeTransactionSources)[number];

export const financePaymentMethods = ["Cash", "QRIS", "Transfer", "VA", "EDC"] as const;
export type FinancePaymentMethod = (typeof financePaymentMethods)[number];

export const financeIncomeCategories = ["Tiket", "Cafe", "Outbound", "Lainnya"] as const;
export const financeExpenseCategories = ["Operasional", "Gaji", "Maintenance", "Peralatan", "Utilitas"] as const;
export type FinanceCategory = (typeof financeIncomeCategories)[number] | (typeof financeExpenseCategories)[number];

export type FinanceCashAccount = {
  id: string;
  nama: FinanceCashAccountName;
  saldoAwal: number;
  saldoSaatIni: number;
  mutasi: number;
  aktif: boolean;
};

export type FinanceBankAccount = {
  id: string;
  namaBank: string;
  nomorRekening: string;
  pemilik: string;
  saldo: number;
  aktif: boolean;
  rekonsiliasiTerakhir?: string;
};

export type FinanceJournalMetadataLine = {
  akun: string;
  posisi: "Debit" | "Kredit";
  nominal: number;
};

export type FinanceJournalMetadata = {
  referensi: string;
  sumber: FinanceTransactionSource;
  keterangan: string;
  lines: FinanceJournalMetadataLine[];
};

export type FinanceTransactionRecord = {
  id: string;
  name: string;
  status: FinanceTransactionType;
  jenis: FinanceTransactionType;
  sumber: FinanceTransactionSource;
  kategori: FinanceCategory;
  metodePembayaran: FinancePaymentMethod;
  nominal: number;
  kasId?: string;
  rekeningId?: string;
  referensi: string;
  deskripsi: string;
  jurnal: FinanceJournalMetadata;
  dibuatPada: string;
  diperbaruiPada: string;
};

export type FinanceValidationIssue = {
  field: string;
  message: string;
};

export type FinanceValidationResult = {
  ok: boolean;
  issues: FinanceValidationIssue[];
};

export type FinanceDashboardSummary = {
  saldoKas: number;
  saldoBank: number;
  pendapatanHariIni: number;
  pengeluaranHariIni: number;
  labaOperasionalHariIni: number;
  cashFlow: number;
  pendapatanPerModul: Array<{ modul: FinanceTransactionSource; nominal: number }>;
};

export type FinanceReportKey = "arus-kas" | "buku-kas" | "rekening-bank" | "pendapatan" | "pengeluaran" | "rekonsiliasi" | "ringkasan-harian" | "ringkasan-bulanan";

export type FinanceOperationalAdapter = {
  fromTicketing: (payload: { referensi: string; nominal: number; metodePembayaran: FinancePaymentMethod }) => FinanceTransactionRecord;
  fromBooking: (payload: { referensi: string; nominal: number; metodePembayaran: FinancePaymentMethod }) => FinanceTransactionRecord;
  fromCafe: (payload: { referensi: string; nominal: number; metodePembayaran: FinancePaymentMethod }) => FinanceTransactionRecord;
  fromOutbound: (payload: { referensi: string; nominal: number; metodePembayaran: FinancePaymentMethod }) => FinanceTransactionRecord;
};

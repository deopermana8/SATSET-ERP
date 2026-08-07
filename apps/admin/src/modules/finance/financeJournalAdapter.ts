import { defaultCategoryBySource } from "./financePayment.js";
import { createFinanceTransaction } from "./financeTransaction.js";
import type { FinanceJournalMetadata, FinancePaymentMethod, FinanceTransactionRecord, FinanceTransactionSource } from "./financeTypes.js";

function metadata(referensi: string, sumber: FinanceTransactionSource, nominal: number, akunDebit: string, akunKredit: string): FinanceJournalMetadata {
  return {
    referensi,
    sumber,
    keterangan: `Metadata jurnal ${sumber} ${referensi}`,
    lines: [
      { akun: akunDebit, posisi: "Debit", nominal },
      { akun: akunKredit, posisi: "Kredit", nominal },
    ],
  };
}

export function buildFinanceJournalAdapter(input: {
  sumber: FinanceTransactionSource;
  referensi: string;
  nominal: number;
  metodePembayaran: FinancePaymentMethod;
  akunKredit: string;
}): FinanceTransactionRecord {
  const akunDebit = input.metodePembayaran === "Cash" ? "Kas" : input.metodePembayaran;
  return createFinanceTransaction({
    jenis: "Pemasukan",
    sumber: input.sumber,
    kategori: defaultCategoryBySource(input.sumber),
    metodePembayaran: input.metodePembayaran,
    nominal: input.nominal,
    referensi: input.referensi,
    deskripsi: `Transaksi ${input.sumber} ${input.referensi}`,
    jurnal: metadata(input.referensi, input.sumber, input.nominal, akunDebit, input.akunKredit),
  });
}

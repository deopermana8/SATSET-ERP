import type { CafeOrderRecord, CafeShiftRecord, CafeValidationResult } from "./cafeTypes.js";

function result(issues: Array<{ field: string; message: string }>): CafeValidationResult {
  return { ok: issues.length === 0, issues };
}

export function validateCafeHarga(harga: number, pajak: number, diskon: number): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (Number(harga) < 0) issues.push({ field: "harga", message: "Harga tidak boleh negatif" });
  if (Number(pajak) < 0 || Number(pajak) > 100) issues.push({ field: "pajak", message: "Pajak harus 0-100" });
  if (Number(diskon) < 0 || Number(diskon) > 100) issues.push({ field: "diskon", message: "Diskon harus 0-100" });
  return result(issues);
}

export function validateCafePembayaran(order: Pick<CafeOrderRecord, "total" | "pembayaran">): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (Number(order.pembayaran.dibayar || 0) < 0) issues.push({ field: "pembayaran", message: "Pembayaran tidak valid" });
  if (order.pembayaran.metode !== "Complimentary" && Number(order.pembayaran.dibayar || 0) < Number(order.total || 0)) {
    issues.push({ field: "pembayaran", message: "Pembayaran kurang dari total transaksi" });
  }
  return result(issues);
}

export function validateCafeVoucher(voucher: string, diskon: number): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (voucher && Number(diskon) <= 0) issues.push({ field: "voucher", message: "Voucher harus memiliki diskon" });
  return result(issues);
}

export function validateCafeRefund(order: CafeOrderRecord): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (order.status === "Void") issues.push({ field: "refund", message: "Pesanan void tidak dapat direfund" });
  if (order.status === "Refund") issues.push({ field: "refund", message: "Pesanan sudah direfund" });
  return result(issues);
}

export function validateCafeVoid(order: CafeOrderRecord): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (order.status === "Refund") issues.push({ field: "void", message: "Pesanan refund tidak dapat di-void" });
  if (order.status === "Dibayar") issues.push({ field: "void", message: "Pesanan dibayar tidak dapat di-void langsung" });
  return result(issues);
}

export function validateSplitBill(parts: number): CafeValidationResult {
  return parts < 2 ? result([{ field: "splitBill", message: "Split bill minimal 2 bagian" }]) : result([]);
}

export function validateMergeBill(orderIds: string[]): CafeValidationResult {
  return orderIds.length < 2 ? result([{ field: "mergeBill", message: "Merge bill minimal 2 pesanan" }]) : result([]);
}

export function validateCafeShift(shift: Partial<CafeShiftRecord>): CafeValidationResult {
  const issues: Array<{ field: string; message: string }> = [];
  if (String(shift.namaKasir || "").trim().length === 0) issues.push({ field: "namaKasir", message: "Nama kasir wajib diisi" });
  if (Number(shift.modalAwal || 0) < 0) issues.push({ field: "modalAwal", message: "Modal awal tidak valid" });
  if (!shift.jamBuka) issues.push({ field: "jamBuka", message: "Jam buka wajib diisi" });
  return result(issues);
}

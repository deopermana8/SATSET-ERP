import type { FinancePaymentMethod, FinanceTransactionSource } from "./financeTypes.js";

export function normalizeFinancePaymentMethod(input: string): FinancePaymentMethod {
  if (input === "QRIS") return "QRIS";
  if (input === "Transfer") return "Transfer";
  if (input === "VA") return "VA";
  if (input === "EDC") return "EDC";
  return "Cash";
}

export function defaultCategoryBySource(source: FinanceTransactionSource): "Tiket" | "Cafe" | "Outbound" | "Lainnya" {
  if (source === "Ticketing") return "Tiket";
  if (source === "Cafe") return "Cafe";
  if (source === "Outbound") return "Outbound";
  return "Lainnya";
}

import type { BookingPricingRule } from "./bookingTypes.js";

function inDateRange(date: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) {
    return true;
  }
  if (startDate && date < startDate) {
    return false;
  }
  if (endDate && date > endDate) {
    return false;
  }
  return true;
}

export function resolveBookingPricing(
  basePrice: number,
  tanggal: string,
  paketWisata: string,
  rules: BookingPricingRule[],
): {
  subtotal: number;
  diskon: number;
  pajak: number;
  total: number;
  appliedRuleIds: string[];
} {
  const activeRules = rules.filter((rule) => rule.active && rule.paketWisata === paketWisata && inDateRange(tanggal, rule.startDate, rule.endDate));
  let subtotal = Math.max(0, basePrice);
  let diskon = 0;
  let tambahan = 0;

  for (const rule of activeRules) {
    if (rule.tag === "diskon" || rule.tag === "promo" || rule.tag === "voucher") {
      diskon += Math.max(0, rule.amount) + (subtotal * Math.max(0, rule.percent) / 100);
    } else {
      tambahan += Math.max(0, rule.amount) + (subtotal * Math.max(0, rule.percent) / 100);
    }
  }

  const setelahPenyesuaian = Math.max(0, subtotal + tambahan - diskon);
  const pajak = Math.round(setelahPenyesuaian * 0.11);
  const total = setelahPenyesuaian + pajak;

  return {
    subtotal,
    diskon: Math.round(diskon),
    pajak,
    total,
    appliedRuleIds: activeRules.map((rule) => rule.id),
  };
}

import type { CafeMenuItem, CafeOrderItem } from "./cafeTypes.js";

export function calculateCafeItemTotals(input: {
  qty: number;
  harga: number;
  pajakPercent: number;
  serviceChargePercent: number;
  diskonPercent: number;
}) {
  const qty = Math.max(0, Number(input.qty || 0));
  const harga = Math.max(0, Number(input.harga || 0));
  const subtotal = qty * harga;
  const diskon = subtotal * Math.max(0, Math.min(Number(input.diskonPercent || 0), 100)) / 100;
  const net = subtotal - diskon;
  const pajak = net * Math.max(0, Number(input.pajakPercent || 0)) / 100;
  const serviceCharge = net * Math.max(0, Number(input.serviceChargePercent || 0)) / 100;
  const total = net + pajak + serviceCharge;
  return {
    subtotal,
    diskon,
    pajak,
    serviceCharge,
    total,
  };
}

export function toCafeOrderItem(menu: CafeMenuItem, qty = 1, catatan = ""): CafeOrderItem {
  const totals = calculateCafeItemTotals({
    qty,
    harga: menu.harga,
    pajakPercent: menu.pajakPercent,
    serviceChargePercent: menu.serviceChargePercent,
    diskonPercent: menu.diskonPercent,
  });
  return {
    id: `${menu.id}-${Date.now()}`,
    menuId: menu.id,
    kodeMenu: menu.kodeMenu,
    namaMenu: menu.namaMenu,
    qty: Math.max(1, qty),
    harga: menu.harga,
    pajakPercent: menu.pajakPercent,
    serviceChargePercent: menu.serviceChargePercent,
    diskonPercent: menu.diskonPercent,
    catatan,
    ...totals,
  };
}

export function calculateCafeOrderTotals(items: CafeOrderItem[], pembulatan = 0) {
  return items.reduce((acc, item) => {
    acc.subtotal += Number(item.subtotal || 0);
    acc.diskon += Number(item.diskon || 0);
    acc.pajak += Number(item.pajak || 0);
    acc.serviceCharge += Number(item.serviceCharge || 0);
    acc.total += Number(item.total || 0);
    return acc;
  }, {
    subtotal: 0,
    diskon: 0,
    pajak: 0,
    serviceCharge: 0,
    pembulatan,
    total: pembulatan,
  });
}

export function calculateKembalian(total: number, dibayar: number): number {
  return Math.max(0, Number(dibayar || 0) - Number(total || 0));
}

export function applyPembulatan(total: number): number {
  const nilai = Number(total || 0);
  const bulat = Math.round(nilai / 100) * 100;
  return bulat - nilai;
}

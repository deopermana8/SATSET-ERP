import { applyPembulatan, calculateCafeOrderTotals, calculateKembalian } from "./cafePricing.js";
import type { CafeMenuItem, CafeOrderItem, CafeOrderRecord, CafePaymentMethod } from "./cafeTypes.js";
import { toCafeOrderItem } from "./cafePricing.js";

function dateCode(now: Date): string {
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

export function generateCafeOrderNo(now = new Date()): string {
  return `POS-${dateCode(now)}-${String(now.getTime()).slice(-6)}`;
}

export function generateCafeQueueNo(now = new Date()): string {
  return `AN-${dateCode(now)}-${String(now.getTime()).slice(-4)}`;
}

export function addCafeItem(items: CafeOrderItem[], menu: CafeMenuItem, qty = 1, catatan = ""): CafeOrderItem[] {
  return items.concat(toCafeOrderItem(menu, qty, catatan));
}

export function removeCafeItem(items: CafeOrderItem[], itemId: string): CafeOrderItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function updateCafeItemQty(items: CafeOrderItem[], itemId: string, qty: number): CafeOrderItem[] {
  return items.map((item) => item.id === itemId ? {
    ...toCafeOrderItem({
      id: item.menuId,
      kodeMenu: item.kodeMenu,
      barcode: "",
      qr: "",
      namaMenu: item.namaMenu,
      kategori: "Makanan",
      harga: item.harga,
      pajakPercent: item.pajakPercent,
      serviceChargePercent: item.serviceChargePercent,
      diskonPercent: item.diskonPercent,
      status: "Aktif",
      foto: "",
      stok: 0,
      satuan: "Porsi",
    }, qty, item.catatan),
    id: item.id,
  } : item);
}

export function updateCafeItemCatatan(items: CafeOrderItem[], itemId: string, catatan: string): CafeOrderItem[] {
  return items.map((item) => item.id === itemId ? { ...item, catatan } : item);
}

export function holdCafeBill(order: CafeOrderRecord): CafeOrderRecord {
  return { ...order, status: "Hold", diperbaruiPada: new Date().toISOString() };
}

export function resumeCafeBill(order: CafeOrderRecord): CafeOrderRecord {
  return { ...order, status: "Draft", diperbaruiPada: new Date().toISOString() };
}

export function splitCafeBill(order: CafeOrderRecord, parts: number): CafeOrderRecord[] {
  const safeParts = Math.max(2, Math.floor(parts));
  return Array.from({ length: safeParts }, (_, index) => ({
    ...order,
    id: `${order.id}-split-${index + 1}`,
    orderNo: `${order.orderNo}-${index + 1}`,
    items: order.items.filter((_, itemIndex) => itemIndex % safeParts === index),
  })).map((entry) => recalculateCafeOrder(entry));
}

export function mergeCafeBills(orders: CafeOrderRecord[]): CafeOrderRecord {
  const base = orders[0];
  return recalculateCafeOrder({
    ...base,
    id: `${base.id}-merge`,
    orderNo: `${base.orderNo}-MERGE`,
    items: orders.flatMap((order) => order.items),
  });
}

export function recalculateCafeOrder(order: CafeOrderRecord): CafeOrderRecord {
  const pembulatan = applyPembulatan(order.items.reduce((acc, item) => acc + item.total, 0));
  const totals = calculateCafeOrderTotals(order.items, pembulatan);
  const dibayar = Number(order.pembayaran.dibayar || 0);
  return {
    ...order,
    subtotal: totals.subtotal,
    diskon: totals.diskon,
    pajak: totals.pajak,
    serviceCharge: totals.serviceCharge,
    pembulatan: totals.pembulatan,
    total: totals.total,
    pembayaran: {
      ...order.pembayaran,
      pembulatan: totals.pembulatan,
      kembalian: calculateKembalian(totals.total, dibayar),
    },
    diperbaruiPada: new Date().toISOString(),
  };
}

export function createCafeReceipt(order: CafeOrderRecord): string {
  const lines = [
    `Struk Cafe ${order.orderNo}`,
    `Kasir: ${order.kasir}`,
    `Status: ${order.status}`,
    "------------------------------",
    ...order.items.map((item) => `${item.namaMenu} x${item.qty} = ${item.total}`),
    "------------------------------",
    `Subtotal: ${order.subtotal}`,
    `Diskon: ${order.diskon}`,
    `Pajak: ${order.pajak}`,
    `Service: ${order.serviceCharge}`,
    `Pembulatan: ${order.pembulatan}`,
    `Total: ${order.total}`,
    `Bayar ${order.pembayaran.metode}: ${order.pembayaran.dibayar}`,
    `Kembalian: ${order.pembayaran.kembalian}`,
  ];
  return lines.join("\n");
}

export function createCafeOrderDraft(kasir: string, metode: CafePaymentMethod = "Tunai"): CafeOrderRecord {
  const now = new Date().toISOString();
  return {
    id: generateCafeOrderNo(),
    name: "Pesanan Cafe",
    status: "Draft",
    orderNo: generateCafeOrderNo(),
    kasir,
    meja: "-",
    items: [],
    pembayaran: {
      metode,
      dibayar: 0,
      pembulatan: 0,
      kembalian: 0,
    },
    kitchen: {
      nomorAntrian: generateCafeQueueNo(),
      status: "Menunggu",
      estimasiMenit: 15,
      prioritas: "Normal",
      riwayatStatus: [{ status: "Menunggu", at: now }],
    },
    subtotal: 0,
    diskon: 0,
    pajak: 0,
    serviceCharge: 0,
    pembulatan: 0,
    total: 0,
    catatan: "",
    dibuatPada: now,
    diperbaruiPada: now,
  };
}

import type { CafeKitchenStatus, CafeOrderRecord } from "./cafeTypes.js";

const transitions: Record<CafeKitchenStatus, CafeKitchenStatus[]> = {
  "Menunggu": ["Diproses", "Batal"],
  "Diproses": ["Siap", "Batal"],
  "Siap": ["Diantar", "Selesai"],
  "Diantar": ["Selesai"],
  "Selesai": [],
  "Batal": [],
};

export function canMoveKitchenStatus(from: CafeKitchenStatus, to: CafeKitchenStatus): boolean {
  return transitions[from].includes(to);
}

export function updateKitchenStatus(order: CafeOrderRecord, next: CafeKitchenStatus): CafeOrderRecord {
  if (!canMoveKitchenStatus(order.kitchen.status, next)) {
    return order;
  }
  const at = new Date().toISOString();
  return {
    ...order,
    kitchen: {
      ...order.kitchen,
      status: next,
      riwayatStatus: order.kitchen.riwayatStatus.concat({ status: next, at }),
    },
    diperbaruiPada: at,
  };
}

export function estimateKitchenTime(order: CafeOrderRecord): number {
  const base = order.items.length * 4;
  const extra = order.items.reduce((acc, item) => acc + Math.max(0, item.qty - 1), 0);
  return Math.max(5, base + extra);
}

export function deriveKitchenPriority(order: CafeOrderRecord): "Rendah" | "Normal" | "Tinggi" {
  if (order.booking || order.tiket) {
    return "Tinggi";
  }
  if (order.items.length >= 5) {
    return "Normal";
  }
  return "Rendah";
}

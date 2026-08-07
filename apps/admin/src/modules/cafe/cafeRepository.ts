import type { RuntimeRequest } from "../runtime-core/index.js";
import type { CafeMenuItem, CafeOrderRecord, CafeShiftRecord } from "./cafeTypes.js";
import { defaultCafeMenus } from "./cafeEngine.js";

export type CafeStorageAdapter = {
  read: <T>(key: string, fallback: T) => T;
  write: <T>(key: string, value: T) => T;
};

export type CafeRepository = {
  listOrders: () => Promise<{ data: CafeOrderRecord[]; total: number }>;
  saveOrder: (order: CafeOrderRecord) => Promise<CafeOrderRecord>;
  deleteOrder: (id: string) => Promise<void>;
  listMenus: () => Promise<{ data: CafeMenuItem[]; total: number }>;
  listShifts: () => Promise<{ data: CafeShiftRecord[]; total: number }>;
  saveShift: (shift: CafeShiftRecord) => Promise<CafeShiftRecord>;
};

function writeCollection<T extends { id: string }>(adapter: CafeStorageAdapter, key: string, record: T): T {
  const rows = adapter.read<T[]>(key, []);
  const index = rows.findIndex((row) => row.id === record.id);
  if (index >= 0) rows[index] = record;
  else rows.unshift(record);
  adapter.write(key, rows);
  return record;
}

export function createCafeRepository(_request: RuntimeRequest, adapter: CafeStorageAdapter): CafeRepository {
  return {
    async listOrders() {
      const data = adapter.read<CafeOrderRecord[]>("satset-cafe-orders", []);
      return { data, total: data.length };
    },
    async saveOrder(order) {
      return writeCollection(adapter, "satset-cafe-orders", order);
    },
    async deleteOrder(id) {
      const rows = adapter.read<CafeOrderRecord[]>("satset-cafe-orders", []).filter((row) => row.id !== id);
      adapter.write("satset-cafe-orders", rows);
    },
    async listMenus() {
      const seeded = adapter.read<CafeMenuItem[]>("satset-cafe-menus", defaultCafeMenus);
      adapter.write("satset-cafe-menus", seeded);
      return { data: seeded, total: seeded.length };
    },
    async listShifts() {
      const data = adapter.read<CafeShiftRecord[]>("satset-cafe-shifts", []);
      return { data, total: data.length };
    },
    async saveShift(shift) {
      return writeCollection(adapter, "satset-cafe-shifts", shift);
    },
  };
}

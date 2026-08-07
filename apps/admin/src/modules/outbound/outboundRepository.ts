import type { RuntimeRequest } from "../runtime-core/index.js";
import { defaultOutboundEquipment } from "./outboundEquipment.js";
import { createOutboundDraft, defaultOutboundPackages } from "./outboundEngine.js";
import { defaultOutboundInstructors } from "./outboundInstructor.js";
import type { OutboundEquipment, OutboundInstructor, OutboundPackage, OutboundRecord } from "./outboundTypes.js";

export type OutboundStorageAdapter = {
  read: <T>(key: string, fallback: T) => T;
  write: <T>(key: string, value: T) => T;
};

export type OutboundRepository = {
  listRecords: () => Promise<{ data: OutboundRecord[]; total: number }>;
  saveRecord: (record: OutboundRecord) => Promise<OutboundRecord>;
  deleteRecord: (id: string) => Promise<void>;
  listPackages: () => Promise<{ data: OutboundPackage[]; total: number }>;
  listInstructors: () => Promise<{ data: OutboundInstructor[]; total: number }>;
  listEquipment: () => Promise<{ data: OutboundEquipment[]; total: number }>;
};

function upsert<T extends { id: string }>(rows: T[], next: T): T[] {
  const index = rows.findIndex((row) => row.id === next.id);
  if (index >= 0) rows[index] = next;
  else rows.unshift(next);
  return rows;
}

export function createOutboundRepository(_request: RuntimeRequest, adapter: OutboundStorageAdapter): OutboundRepository {
  return {
    async listRecords() {
      const seeded = adapter.read<OutboundRecord[]>("satset-outbound-records", [createOutboundDraft("Outbound Pagi")]);
      adapter.write("satset-outbound-records", seeded);
      return { data: seeded, total: seeded.length };
    },
    async saveRecord(record) {
      const rows = adapter.read<OutboundRecord[]>("satset-outbound-records", []);
      adapter.write("satset-outbound-records", upsert(rows, record));
      return record;
    },
    async deleteRecord(id) {
      const rows = adapter.read<OutboundRecord[]>("satset-outbound-records", []).filter((row) => row.id !== id);
      adapter.write("satset-outbound-records", rows);
    },
    async listPackages() {
      const seeded = adapter.read<OutboundPackage[]>("satset-outbound-packages", defaultOutboundPackages);
      adapter.write("satset-outbound-packages", seeded);
      return { data: seeded, total: seeded.length };
    },
    async listInstructors() {
      const seeded = adapter.read<OutboundInstructor[]>("satset-outbound-instructors", defaultOutboundInstructors);
      adapter.write("satset-outbound-instructors", seeded);
      return { data: seeded, total: seeded.length };
    },
    async listEquipment() {
      const seeded = adapter.read<OutboundEquipment[]>("satset-outbound-equipment", defaultOutboundEquipment);
      adapter.write("satset-outbound-equipment", seeded);
      return { data: seeded, total: seeded.length };
    },
  };
}

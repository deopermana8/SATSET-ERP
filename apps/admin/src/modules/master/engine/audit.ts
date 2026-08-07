import type { MasterAuditAction, MasterAuditEntry } from "./types.js";

export type AuditQuery = {
  entity?: string;
  action?: MasterAuditAction;
  limit?: number;
};

export type AuditStore = {
  record: (entry: Omit<MasterAuditEntry, "id" | "timestamp">) => MasterAuditEntry;
  list: (query?: AuditQuery) => MasterAuditEntry[];
  clear: () => void;
};

export function createAuditStore(maxEntries = 1000): AuditStore {
  const size = Math.max(32, maxEntries);
  const bucket: Array<MasterAuditEntry | undefined> = new Array(size);
  let writeIndex = 0;
  let used = 0;

  const makeId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const record = (entry: Omit<MasterAuditEntry, "id" | "timestamp">): MasterAuditEntry => {
    const next: MasterAuditEntry = {
      id: makeId(),
      timestamp: Date.now(),
      ...entry,
    };
    bucket[writeIndex] = next;
    writeIndex = (writeIndex + 1) % size;
    used = Math.min(size, used + 1);
    return next;
  };

  const list = (query: AuditQuery = {}): MasterAuditEntry[] => {
    const ordered: MasterAuditEntry[] = [];
    for (let i = 0; i < used; i += 1) {
      const index = (writeIndex - 1 - i + size) % size;
      const entry = bucket[index];
      if (!entry) {
        continue;
      }
      ordered.push(entry);
    }

    const filtered = ordered.filter((entry) => {
      if (query.entity && entry.entity !== query.entity) {
        return false;
      }
      if (query.action && entry.action !== query.action) {
        return false;
      }
      return true;
    });

    if (typeof query.limit === "number" && query.limit > 0) {
      return filtered.slice(0, query.limit);
    }
    return filtered;
  };

  const clear = (): void => {
    bucket.fill(undefined);
    writeIndex = 0;
    used = 0;
  };

  return { record, list, clear };
}

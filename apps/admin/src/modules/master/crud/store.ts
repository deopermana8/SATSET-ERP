import type { MasterEntityKey, MasterFilterState, MasterFormState, MasterRecord, MasterTableState } from "./types.js";

type CacheEntry<T extends MasterRecord> = {
  items: T[];
  total: number;
  updatedAt: number;
};

const sharedCache = new Map<MasterEntityKey, CacheEntry<MasterRecord>>();

export function createMasterTableState(entity: MasterEntityKey): MasterTableState {
  return {
    entity,
    page: 1,
    pageSize: 10,
    search: "",
    selectedIds: [],
    visibleColumns: { id: true, name: true, status: true },
    sortStack: [],
  };
}

export function createMasterFormState(): MasterFormState {
  return {
    editingId: null,
    dirty: false,
    autosaveEnabled: true,
    draft: {},
    undoStack: [],
    redoStack: [],
  };
}

export function createMasterFilterState(): MasterFilterState {
  return {};
}

export function cacheMasterItems<T extends MasterRecord>(entity: MasterEntityKey, items: T[]): void {
  sharedCache.set(entity, { items, total: items.length, updatedAt: Date.now() });
}

export function readMasterCache<T extends MasterRecord>(entity: MasterEntityKey): CacheEntry<T> | null {
  return (sharedCache.get(entity) as CacheEntry<T> | undefined) ?? null;
}

export function clearMasterCache(entity?: MasterEntityKey): void {
  if (entity) {
    sharedCache.delete(entity);
    return;
  }
  sharedCache.clear();
}

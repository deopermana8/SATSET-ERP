import type { MasterFilter, MasterFilterState, MasterRecord } from "../crud/types.js";

export function applyMasterFilters<T extends MasterRecord>(items: T[], filters: MasterFilterState): T[] {
  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return true;
      }
      const itemValue = item[key];
      if (Array.isArray(value)) {
        return value.includes(String(itemValue ?? ""));
      }
      return String(itemValue ?? "").toLowerCase().includes(String(value).toLowerCase());
    });
  });
}

export function serializeMasterFilters(filters: MasterFilterState): string {
  return JSON.stringify(filters);
}

export function hydrateMasterFilters(serialized: string | null): MasterFilterState {
  if (!serialized) {
    return {};
  }
  try {
    return JSON.parse(serialized) as MasterFilterState;
  } catch {
    return {};
  }
}

export function buildMasterFilterDefaults(definitions: MasterFilter[]): MasterFilterState {
  return definitions.reduce<MasterFilterState>((acc, definition) => {
    acc[definition.key] = definition.type === "multiselect" ? [] : "";
    return acc;
  }, {});
}

import type { MasterColumn, MasterEntityKey, MasterField, MasterFilter, MasterModuleConfig } from "./crud/types.js";

const defaultColumns: MasterColumn[] = [
  { key: "id", label: "ID", searchable: true, filterable: true, sticky: true },
  { key: "name", label: "Nama", searchable: true, filterable: true },
  { key: "status", label: "Status", searchable: true, filterable: true },
];

const defaultFields: MasterField[] = [
  { name: "name", label: "Nama", input: "text", required: true, section: "Informasi Utama" },
  {
    name: "status",
    label: "Status",
    input: "select",
    required: true,
    section: "Informasi Utama",
    options: [
      { label: "Aktif", value: "aktif" },
      { label: "Nonaktif", value: "nonaktif" },
      { label: "Pending", value: "pending" },
    ],
  },
  { name: "notes", label: "Keterangan", input: "textarea", section: "Detail" },
];

const defaultFilters: MasterFilter[] = [
  { key: "query", label: "Cari", type: "text", field: "name" },
  { key: "status", label: "Status", type: "status", field: "status", options: defaultFields[1].options },
];

function createModule(input: Omit<MasterModuleConfig, "columns" | "fields" | "filters" | "actions" | "quickCreate" | "note"> & Partial<Pick<MasterModuleConfig, "columns" | "fields" | "filters">>): MasterModuleConfig {
  const label = input.label;
  return {
    ...input,
    columns: input.columns ?? defaultColumns,
    fields: input.fields ?? defaultFields,
    filters: input.filters ?? defaultFilters,
    actions: [
      { key: "create", label: `Tambah ${label}` },
      { key: "edit", label: `Ubah ${label}` },
      { key: "delete", label: `Hapus ${label}` },
      { key: "export", label: `Export ${label}` },
    ],
    quickCreate: `Tambah ${label}`,
    note: `${label} master data managed by the reusable SATSET engine.`,
  };
}

export const masterModules = [
  createModule({ key: "destinasi", label: "Destinasi", description: "Data destinasi wisata", icon: "📍", apiEntity: "destinasi", searchTerms: ["Bromo", "Raja Ampat", "Ubud", "Destinasi"] }),
  createModule({ key: "hotel", label: "Hotel", description: "Data hotel partner", icon: "🏨", apiEntity: "hotel", searchTerms: ["Resort", "Merapi", "Sagara", "Hotel"] }),
  createModule({ key: "guide", label: "Guide", description: "Data pemandu wisata", icon: "🧭", apiEntity: "guide", searchTerms: ["Andi", "Rina", "Guide"] }),
  createModule({ key: "kendaraan", label: "Kendaraan", description: "Armada dan kendaraan operasional", icon: "🚐", apiEntity: "kendaraan", searchTerms: ["Bus", "Hiace", "Elf", "Kendaraan"] }),
  createModule({ key: "paket-wisata", label: "Paket Wisata", description: "Bundle dan paket perjalanan", icon: "🧳", apiEntity: "paket-wisata", searchTerms: ["Family", "Honeymoon", "Adventure", "Paket"] }),
  createModule({ key: "customer", label: "Pelanggan", description: "Data pelanggan dan tamu", icon: "👤", apiEntity: "customer", searchTerms: ["Pelanggan", "Tamu", "Klien"] }),
  createModule({ key: "vendor", label: "Vendor", description: "Mitra pemasok jasa", icon: "🏬", apiEntity: "vendor", searchTerms: ["Vendor", "Mitra", "Partner"] }),
  createModule({ key: "supplier", label: "Pemasok", description: "Data pemasok barang dan jasa", icon: "📦", apiEntity: "supplier", searchTerms: ["Pemasok", "Persediaan", "Stok"] }),
] as const satisfies readonly MasterModuleConfig[];

export const masterModuleMap = Object.fromEntries(masterModules.map((module) => [module.key, module])) as Record<MasterEntityKey, MasterModuleConfig>;

export const masterModuleKeys = masterModules.map((module) => module.key);

export function getMasterModule(entity: MasterEntityKey): MasterModuleConfig {
  return masterModuleMap[entity];
}

export function getMasterLabelMap(): Record<string, string> {
  return masterModules.reduce<Record<string, string>>((acc, module) => {
    acc[module.key] = module.label;
    return acc;
  }, {});
}

export function getMasterSearchPool(): string[] {
  return masterModules.flatMap((module) => [module.label, ...module.searchTerms]);
}

export function getMasterDetailEntities(): MasterEntityKey[] {
  return masterModuleKeys.filter((key) => key === "destinasi" || key === "hotel" || key === "guide" || key === "kendaraan" || key === "paket-wisata");
}

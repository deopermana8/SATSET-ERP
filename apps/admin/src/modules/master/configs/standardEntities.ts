import type { MasterEntityConfig } from "../engine/types.js";

const statusField: MasterEntityConfig["fields"][number] = {
  name: "status",
  label: "Status",
  input: "select" as const,
  options: [
    { label: "Aktif", value: "aktif" },
    { label: "Nonaktif", value: "nonaktif" },
    { label: "Pending", value: "pending" },
  ],
  validation: [{ type: "required", message: "Status wajib dipilih" }],
};

function baseEntity(key: string, name: string, route: string, endpoint: string, icon: string): MasterEntityConfig {
  return {
    key,
    name,
    icon,
    route,
    endpoint,
    defaultSort: { field: "name", direction: "asc" },
    defaultSearch: "name",
    defaultPageSize: 10,
    fields: [
      {
        name: "name",
        label: "Nama",
        input: "text",
        required: true,
        validation: [
          { type: "required", message: "Nama wajib diisi" },
          { type: "min", value: 2, message: "Nama minimal 2 karakter" },
          { type: "max", value: 120, message: "Nama maksimal 120 karakter" },
        ],
      },
      statusField,
      {
        name: "keterangan",
        label: "Keterangan",
        input: "textarea",
        validation: [{ type: "max", value: 500, message: "Keterangan maksimal 500 karakter" }],
      },
    ],
    tableColumns: [
      { key: "id", label: "ID", searchable: true, sortable: true, sticky: true, visible: true, resizable: true, width: 180 },
      { key: "name", label: "Nama", searchable: true, sortable: true, visible: true, resizable: true, width: 220 },
      { key: "status", label: "Status", searchable: true, sortable: true, visible: true, resizable: true, width: 140 },
      { key: "keterangan", label: "Keterangan", searchable: true, sortable: false, visible: true, resizable: true, width: 240 },
    ],
    validation: [],
    searchableFields: ["id", "name", "status", "keterangan"],
    sortableFields: ["id", "name", "status"],
    filters: [
      {
        key: "nama",
        label: "Nama",
        field: "name",
        operators: ["equals", "notEquals", "contains", "startsWith", "endsWith", "empty", "notEmpty"],
      },
      {
        key: "status",
        label: "Status",
        field: "status",
        operators: ["equals", "notEquals", "multiSelect"],
        options: statusField.options,
      },
    ],
    permissions: {
      view: `${key}:view`,
      create: `${key}:create`,
      edit: `${key}:edit`,
      delete: `${key}:delete`,
      export: `${key}:export`,
      import: `${key}:import`,
      approval: `${key}:approval`,
    },
  };
}

export const standardMasterEntities: MasterEntityConfig[] = [
  baseEntity("customer", "Pelanggan", "/master/pelanggan", "/erp-wisata/customer", "👤"),
  baseEntity("supplier", "Pemasok", "/master/pemasok", "/erp-wisata/supplier", "📦"),
  baseEntity("barang", "Barang", "/master/barang", "/erp-wisata/barang", "📦"),
  baseEntity("gudang", "Gudang", "/master/gudang", "/erp-wisata/gudang", "🏬"),
  baseEntity("karyawan", "Karyawan", "/master/karyawan", "/erp-wisata/karyawan", "🧑"),
  baseEntity("jabatan", "Jabatan", "/master/jabatan", "/erp-wisata/jabatan", "🪪"),
  baseEntity("departemen", "Departemen", "/master/departemen", "/erp-wisata/departemen", "🏛"),
  baseEntity("satuan", "Satuan", "/master/satuan", "/erp-wisata/satuan", "📏"),
  baseEntity("kategori", "Kategori", "/master/kategori", "/erp-wisata/kategori", "🗂"),
  baseEntity("brand", "Brand", "/master/brand", "/erp-wisata/brand", "🏷"),
  baseEntity("pajak", "Pajak", "/master/pajak", "/erp-wisata/pajak", "🧾"),
  baseEntity("bank", "Bank", "/master/bank", "/erp-wisata/bank", "🏦"),
  baseEntity("vendor", "Vendor", "/master/vendor", "/erp-wisata/vendor", "🏢"),
];

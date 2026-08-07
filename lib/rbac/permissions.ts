// RBAC seed compatible: { code, name, module, description }
export const PERMISSION_DEFINITIONS = [
  {
    code: "wisata.read",
    name: "wisata.read",
    module: "erp-wisata",
    description: "Baca data ERP Wisata."
  },
  {
    code: "wisata.write",
    name: "wisata.write",
    module: "erp-wisata",
    description: "Kelola data ERP Wisata."
  },
  {
    code: "wisata.master",
    name: "wisata.master",
    module: "erp-wisata",
    description: "Kelola master data wisata."
  },
  {
    code: "wisata.reservasi",
    name: "wisata.reservasi",
    module: "erp-wisata",
    description: "Kelola reservasi wisata."
  },
  {
    code: "wisata.keuangan",
    name: "wisata.keuangan",
    module: "erp-wisata",
    description: "Kelola keuangan wisata."
  },
  {
    code: "wisata.laporan",
    name: "wisata.laporan",
    module: "erp-wisata",
    description: "Akses laporan wisata."
  },
] as const;

export type PermissionCode = typeof PERMISSION_DEFINITIONS[number]["code"];

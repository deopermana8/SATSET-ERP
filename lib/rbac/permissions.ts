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
  {
    code: "settings.admin",
    name: "settings.admin",
    module: "super-admin",
    description: "Akses menu pengaturan super admin."
  },
  {
    code: "settings.modules",
    name: "settings.modules",
    module: "super-admin",
    description: "Aktifkan/nonaktifkan modul usaha."
  },
  {
    code: "settings.dashboard",
    name: "settings.dashboard",
    module: "super-admin",
    description: "Konfigurasi tampilan dashboard."
  },
  {
    code: "settings.users",
    name: "settings.users",
    module: "super-admin",
    description: "Kelola hak akses pengguna."
  },
] as const;

export type PermissionCode = typeof PERMISSION_DEFINITIONS[number]["code"];

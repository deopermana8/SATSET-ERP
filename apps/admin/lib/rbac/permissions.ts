// Canonical permission codes — single source of truth for the entire app.
export const PERMISSIONS = {
  TICKET_VIEW:   "ticket.view",
  TICKET_CREATE: "ticket.create",
  TICKET_UPDATE: "ticket.update",
  TICKET_DELETE: "ticket.delete",

  CATEGORY_VIEW:   "category.view",
  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",

  DESTINATION_VIEW:   "destination.view",
  DESTINATION_CREATE: "destination.create",
  DESTINATION_UPDATE: "destination.update",
  DESTINATION_DELETE: "destination.delete",

  FACILITY_VIEW:   "facility.view",
  FACILITY_CREATE: "facility.create",
  FACILITY_UPDATE: "facility.update",
  FACILITY_DELETE: "facility.delete",

  GATE_VIEW:   "gate.view",
  GATE_CREATE: "gate.create",
  GATE_UPDATE: "gate.update",
  GATE_DELETE: "gate.delete",

  VISITOR_VIEW:   "visitor.view",
  VISITOR_CREATE: "visitor.create",
  VISITOR_UPDATE: "visitor.update",
  VISITOR_DELETE: "visitor.delete",

  RESERVATION_VIEW:   "reservation.view",
  RESERVATION_CREATE: "reservation.create",
  RESERVATION_UPDATE: "reservation.update",
  RESERVATION_DELETE: "reservation.delete",

  PAYMENT_VIEW:   "payment.view",
  PAYMENT_CREATE: "payment.create",
  PAYMENT_UPDATE: "payment.update",
  PAYMENT_DELETE: "payment.delete",

  USER_VIEW:   "user.view",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  ROLE_VIEW:   "role.view",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",

  PERMISSION_VIEW:   "permission.view",
  PERMISSION_MANAGE: "permission.manage",

  REPORT_VIEW: "report.view",

  EMPLOYEE_VIEW:   "employee.view",
  EMPLOYEE_CREATE: "employee.create",
  EMPLOYEE_UPDATE: "employee.update",
  EMPLOYEE_DELETE: "employee.delete",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Full metadata for seeding and UI display.
export const PERMISSION_DEFINITIONS: Array<{
  code: PermissionCode;
  name: string;
  module: string;
  description?: string;
}> = [
  { code: "ticket.view",   name: "Lihat Tiket",          module: "ticket" },
  { code: "ticket.create", name: "Buat Tiket",            module: "ticket" },
  { code: "ticket.update", name: "Edit Tiket",            module: "ticket" },
  { code: "ticket.delete", name: "Hapus Tiket",           module: "ticket" },

  { code: "category.view",   name: "Lihat Kategori",     module: "category" },
  { code: "category.create", name: "Buat Kategori",      module: "category" },
  { code: "category.update", name: "Edit Kategori",      module: "category" },
  { code: "category.delete", name: "Hapus Kategori",     module: "category" },

  { code: "destination.view",   name: "Lihat Destinasi", module: "destination" },
  { code: "destination.create", name: "Buat Destinasi",  module: "destination" },
  { code: "destination.update", name: "Edit Destinasi",  module: "destination" },
  { code: "destination.delete", name: "Hapus Destinasi", module: "destination" },

  { code: "facility.view",   name: "Lihat Fasilitas",    module: "facility" },
  { code: "facility.create", name: "Buat Fasilitas",     module: "facility" },
  { code: "facility.update", name: "Edit Fasilitas",     module: "facility" },
  { code: "facility.delete", name: "Hapus Fasilitas",    module: "facility" },

  { code: "gate.view",   name: "Lihat Gate",             module: "gate" },
  { code: "gate.create", name: "Buat Gate",              module: "gate" },
  { code: "gate.update", name: "Edit Gate",              module: "gate" },
  { code: "gate.delete", name: "Hapus Gate",             module: "gate" },

  { code: "visitor.view",   name: "Lihat Pengunjung",    module: "visitor" },
  { code: "visitor.create", name: "Buat Pengunjung",     module: "visitor" },
  { code: "visitor.update", name: "Edit Pengunjung",     module: "visitor" },
  { code: "visitor.delete", name: "Hapus Pengunjung",    module: "visitor" },

  { code: "reservation.view",   name: "Lihat Reservasi", module: "reservation" },
  { code: "reservation.create", name: "Buat Reservasi",  module: "reservation" },
  { code: "reservation.update", name: "Edit Reservasi",  module: "reservation" },
  { code: "reservation.delete", name: "Hapus Reservasi", module: "reservation" },

  { code: "payment.view",   name: "Lihat Pembayaran",    module: "payment" },
  { code: "payment.create", name: "Buat Pembayaran",     module: "payment" },
  { code: "payment.update", name: "Edit Pembayaran",     module: "payment" },
  { code: "payment.delete", name: "Hapus Pembayaran",    module: "payment" },

  { code: "user.view",   name: "Lihat User",             module: "user" },
  { code: "user.create", name: "Buat User",              module: "user" },
  { code: "user.update", name: "Edit User",              module: "user" },
  { code: "user.delete", name: "Hapus User",             module: "user" },

  { code: "role.view",   name: "Lihat Role",             module: "role" },
  { code: "role.create", name: "Buat Role",              module: "role" },
  { code: "role.update", name: "Edit Role",              module: "role" },
  { code: "role.delete", name: "Hapus Role",             module: "role" },

  { code: "permission.view",   name: "Lihat Permission", module: "permission" },
  { code: "permission.manage", name: "Kelola Permission", module: "permission" },

  { code: "report.view", name: "Lihat Laporan",          module: "report" },

  { code: "employee.view",   name: "Lihat Karyawan",     module: "employee" },
  { code: "employee.create", name: "Buat Karyawan",      module: "employee" },
  { code: "employee.update", name: "Edit Karyawan",      module: "employee" },
  { code: "employee.delete", name: "Hapus Karyawan",     module: "employee" },
];

// Menu items with the permission required to see them.
export const MENU_PERMISSIONS: Array<{
  label: string;
  href: string;
  icon: string;
  permission: PermissionCode | null; // null = always visible (e.g. Dashboard)
}> = [
  { label: "Dashboard",  href: "/dashboard",   icon: "🏠", permission: null },
  { label: "Tiket",      href: "/ticket",      icon: "🎫", permission: "ticket.view" },
  { label: "Reservasi",  href: "/reservation", icon: "📅", permission: "reservation.view" },
  { label: "Pengunjung", href: "/visitor",     icon: "👤", permission: "visitor.view" },
  { label: "Pembayaran", href: "/payment",     icon: "💳", permission: "payment.view" },
  { label: "Destinasi",  href: "/destination", icon: "🗺️", permission: "destination.view" },
  { label: "Fasilitas",  href: "/facility",    icon: "🏗️", permission: "facility.view" },
  { label: "Gate",       href: "/gate",        icon: "🚧", permission: "gate.view" },
  { label: "Kategori",   href: "/category",    icon: "🏷️", permission: "category.view" },
  { label: "Karyawan",   href: "/employee",    icon: "👨‍💼", permission: "employee.view" },
  { label: "Laporan",    href: "/report",      icon: "📊", permission: "report.view" },
  { label: "User",       href: "/user",        icon: "👥", permission: "user.view" },
  { label: "Role",       href: "/role",        icon: "🔐", permission: "role.view" },
  { label: "Permission", href: "/permission",  icon: "🛡️", permission: "permission.view" },
  { label: "Setting",    href: "/setting",     icon: "⚙️", permission: null },
];

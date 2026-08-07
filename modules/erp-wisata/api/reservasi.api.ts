export const reservasiApiDefinition = {
  route: "/api/erp-wisata/reservasis",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  permissions: [
    "wisata.read",
    "wisata.write",
    "wisata.master",
    "wisata.reservasi",
    "wisata.keuangan",
    "wisata.laporan",
  ]
} as const;

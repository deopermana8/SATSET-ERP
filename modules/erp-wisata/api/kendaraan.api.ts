export const kendaraanApiDefinition = {
  route: "/api/erp-wisata/kendaraans",
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

export const pembayaranApiDefinition = {
  route: "/api/erp-wisata/pembayarans",
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

export const ticketingApiDefinition = {
  route: "/api/erp-wisata/ticketings",
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

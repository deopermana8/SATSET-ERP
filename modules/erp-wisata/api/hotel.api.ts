export const hotelApiDefinition = {
  route: "/api/erp-wisata/hotels",
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

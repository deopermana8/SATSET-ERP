export const paketWisataServiceDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  permissions: [
    "wisata.read",
    "wisata.write",
    "wisata.master",
    "wisata.reservasi",
    "wisata.keuangan",
    "wisata.laporan",
  ],
  lifecycle: ["validate", "persist", "emit"]
} as const;

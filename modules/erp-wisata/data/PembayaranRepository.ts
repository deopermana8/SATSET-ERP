export const pembayaranRepositoryDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  storage: "erp-wisata.pembayaran",
  selectors: [
    "id",
    "kode",
    "nama",
    "status",
    "keterangan",
  ],
  relations: [
    {
      name: "pemesan",
      target: "Pelanggan",
      kind: "many-to-one"
    },
  ]
} as const;

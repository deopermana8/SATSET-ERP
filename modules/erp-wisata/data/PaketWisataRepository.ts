export const paketWisataRepositoryDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  storage: "erp-wisata.paket-wisata",
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

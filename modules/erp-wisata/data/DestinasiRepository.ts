export const destinasiRepositoryDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  storage: "erp-wisata.destinasi",
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

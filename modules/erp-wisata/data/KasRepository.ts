export const kasRepositoryDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  storage: "erp-wisata.kas",
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

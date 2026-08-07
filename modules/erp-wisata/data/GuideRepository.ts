export const guideRepositoryDefinition = {
  module: "ErpWisata",
  entity: "Destinasi",
  storage: "erp-wisata.guide",
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

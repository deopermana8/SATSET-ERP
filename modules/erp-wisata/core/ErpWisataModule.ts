export const erpWisataModule = {
  module: "ErpWisata",
  entity: "Destinasi",
  description: "Blueprint ERP Wisata untuk operasional destinasi, paket, hotel, kendaraan, guide, reservasi, ticketing, pembayaran, kas, jurnal, dan laporan.",
  fields: [
    {
      name: "id",
      type: "String",
      required: true,
      unique: true,
      label: "ID",
      searchable: true,
      filterable: true,
      input: "text"
    },
    {
      name: "kode",
      type: "String",
      required: true,
      unique: true,
      label: "Kode",
      searchable: true,
      filterable: true,
      input: "text"
    },
    {
      name: "nama",
      type: "String",
      required: true,
      unique: false,
      label: "Nama",
      searchable: true,
      filterable: true,
      input: "text"
    },
    {
      name: "status",
      type: "String",
      required: true,
      unique: false,
      label: "Status",
      searchable: true,
      filterable: true,
      input: "select"
    },
    {
      name: "keterangan",
      type: "String",
      required: false,
      unique: false,
      label: "Keterangan",
      searchable: false,
      filterable: false,
      input: "textarea"
    },
  ],
  relations: [
    {
      name: "pemesan",
      target: "Pelanggan",
      kind: "many-to-one"
    },
  ]
} as const;

export const pembayaranSeedPlan = {
  module: "ErpWisata",
  entity: "Destinasi",
  seedFields: [
    {
      name: "id",
      type: "String",
      defaultValue: "",
      label: "ID"
    },
    {
      name: "kode",
      type: "String",
      defaultValue: "",
      label: "Kode"
    },
    {
      name: "nama",
      type: "String",
      defaultValue: "",
      label: "Nama"
    },
    {
      name: "status",
      type: "String",
      defaultValue: ""aktif"",
      label: "Status"
    },
    {
      name: "keterangan",
      type: "String",
      defaultValue: "",
      label: "Keterangan"
    },
  ]
} as const;

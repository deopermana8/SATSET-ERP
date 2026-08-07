export const erpWisataMobileScreen = {
  module: "ErpWisata",
  screen: "WisataHome",
  offline: true,
  fields: [
    {
      name: "id",
      label: "ID",
      input: "text"
    },
    {
      name: "kode",
      label: "Kode",
      input: "text"
    },
    {
      name: "nama",
      label: "Nama",
      input: "text"
    },
    {
      name: "status",
      label: "Status",
      input: "select"
    },
    {
      name: "keterangan",
      label: "Keterangan",
      input: "textarea"
    },
  ]
} as const;

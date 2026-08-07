export const guideFormSchema = [
  {
    name: "id",
    label: "ID",
    input: "text",
    required: true,
    searchable: true
  },
  {
    name: "kode",
    label: "Kode",
    input: "text",
    required: true,
    searchable: true
  },
  {
    name: "nama",
    label: "Nama",
    input: "text",
    required: true,
    searchable: true
  },
  {
    name: "status",
    label: "Status",
    input: "select",
    required: true,
    searchable: true
  },
  {
    name: "keterangan",
    label: "Keterangan",
    input: "textarea",
    required: false,
    searchable: false
  },
] as const;

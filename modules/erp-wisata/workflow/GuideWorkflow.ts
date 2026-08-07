export const guideWorkflow = [
  {
    name: "DestinasiWorkflow",
    steps: [
{{#each this.steps}}      {
        name: "DestinasiWorkflow",
        actor: "",
        next: [{{#each this.next}}"{
  "name": "DestinasiWorkflow",
  "steps": [
    {
      "actor": "requester",
      "name": "Reservasi",
      "next": [
        "Pembayaran"
      ]
    },
    {
      "actor": "cashier",
      "name": "Pembayaran",
      "next": [
        "QR"
      ]
    },
    {
      "actor": "system",
      "name": "QR",
      "next": [
        "Gate",
        "Audit"
      ]
    },
    {
      "actor": "gate",
      "name": "Gate",
      "next": [
        "Laporan"
      ]
    },
    {
      "actor": "audit",
      "name": "Audit",
      "next": [
        "Laporan"
      ]
    },
    {
      "actor": "manager",
      "name": "Laporan",
      "next": []
    }
  ]
}", ]
      },
{{/each}}    ]
  },
{{/each}}] as const;

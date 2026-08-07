export const erpWisataDashboardDefinition = {
  module: "ErpWisata",
  widgets: [
    {
      name: "totalReservasi",
      type: "metric",
      metric: "count(id)"
    },
    {
      name: "totalDestinasi",
      type: "metric",
      metric: "count(id)"
    },
    {
      name: "totalPendapatan",
      type: "metric",
      metric: "sum(nominal)"
    },
  ]
} as const;

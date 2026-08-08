export const inventoryRoutes = {
  list: "/api/inventory",
  getById: /^\/api\/inventory\/([^/]+)$/,
  create: "/api/inventory",
  update: /^\/api\/inventory\/([^/]+)$/,
  report: "/api/inventory/report",
  dashboard: "/api/inventory/dashboard",
  stockAdjustment: "/api/inventory/stock-adjustment"
} as const;

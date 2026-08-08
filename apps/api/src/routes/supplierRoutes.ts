export const supplierRoutes = {
  list: "/api/supplier",
  getById: /^\/api\/supplier\/([^/]+)$/,
  create: "/api/supplier",
  update: /^\/api\/supplier\/([^/]+)$/,
  delete: /^\/api\/supplier\/([^/]+)$/
} as const;

export const purchaseOrderRoutes = {
  list: "/api/purchase-order",
  create: "/api/purchase-order",
  getById: /^\/api\/purchase-order\/([^/]+)$/,
  approve: /^\/api\/purchase-order\/([^/]+)\/approve$/,
  receive: /^\/api\/purchase-order\/([^/]+)\/receive$/,
  cancel: /^\/api\/purchase-order\/([^/]+)\/cancel$/
} as const;

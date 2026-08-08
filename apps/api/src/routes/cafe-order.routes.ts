export const CAFE_ORDER_ROUTES = {
  get: {
    method: "GET",
    path: "/cafe-order"
  },
  getById: {
    method: "GET",
    path: "/cafe-order/:id"
  },
  post: {
    method: "POST",
    path: "/cafe-order"
  },
  postPay: {
    method: "POST",
    path: "/cafe-order/:id/pay"
  },
  postPrint: {
    method: "POST",
    path: "/cafe-order/:id/print"
  },
  postVoid: {
    method: "POST",
    path: "/cafe-order/:id/void"
  },
  getReport: {
    method: "GET",
    path: "/cafe-order/report"
  },
  getSummary: {
    method: "GET",
    path: "/cafe-order/summary"
  }
};

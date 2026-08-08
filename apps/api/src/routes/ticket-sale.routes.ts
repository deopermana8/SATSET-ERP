export const TICKET_SALE_ROUTES = {
  get: {
    method: "GET",
    path: "/ticket-sale"
  },
  getById: {
    method: "GET",
    path: "/ticket-sale/:id"
  },
  post: {
    method: "POST",
    path: "/ticket-sale"
  },
  postPay: {
    method: "POST",
    path: "/ticket-sale/:id/pay"
  },
  postPrint: {
    method: "POST",
    path: "/ticket-sale/:id/print"
  },
  getQr: {
    method: "GET",
    path: "/ticket-sale/:id/qr"
  },
  postCheckIn: {
    method: "POST",
    path: "/ticket-sale/checkin"
  },
  postVoid: {
    method: "POST",
    path: "/ticket-sale/:id/void"
  },
  getTicket: {
    method: "GET",
    path: "/ticket-sale/:id/ticket"
  },
  getSummary: {
    method: "GET",
    path: "/ticket-sale/summary"
  },
  getReport: {
    method: "GET",
    path: "/ticket-sale/report"
  }
};

// TODO: wire route handlers

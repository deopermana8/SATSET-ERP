export const CASHIER_SHIFT_ROUTES = {
  postOpen: {
    method: "POST",
    path: "/cashier-shift/open"
  },
  postClose: {
    method: "POST",
    path: "/cashier-shift/close"
  },
  getCurrent: {
    method: "GET",
    path: "/cashier-shift/current"
  },
  getSummary: {
    method: "GET",
    path: "/cashier-shift/summary"
  },
  getHistory: {
    method: "GET",
    path: "/cashier-shift/history"
  }
};

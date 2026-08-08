export const RESERVATION_ROUTES = {
  get: {
    method: "GET",
    path: "/reservation"
  },
  getById: {
    method: "GET",
    path: "/reservation/:id"
  },
  post: {
    method: "POST",
    path: "/reservation"
  },
  postPay: {
    method: "POST",
    path: "/reservation/:id/pay"
  },
  postConfirm: {
    method: "POST",
    path: "/reservation/:id/confirm"
  },
  postCheckIn: {
    method: "POST",
    path: "/reservation/:id/checkin"
  },
  postCancel: {
    method: "POST",
    path: "/reservation/:id/cancel"
  },
  getQr: {
    method: "GET",
    path: "/reservation/:id/qr"
  },
  getReport: {
    method: "GET",
    path: "/reservation/report"
  }
};

export const ACTIVITY_BOOKING_ROUTES = {
  get: {
    method: "GET",
    path: "/activity-booking"
  },
  post: {
    method: "POST",
    path: "/activity-booking"
  },
  postPay: {
    method: "POST",
    path: "/activity-booking/:id/pay"
  },
  postCheckIn: {
    method: "POST",
    path: "/activity-booking/:id/checkin"
  },
  postCancel: {
    method: "POST",
    path: "/activity-booking/:id/cancel"
  },
  getReport: {
    method: "GET",
    path: "/activity-booking/report"
  },
  getQr: {
    method: "GET",
    path: "/activity-booking/:id/qr"
  }
};

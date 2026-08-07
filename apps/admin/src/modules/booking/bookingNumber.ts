export type BookingNumberGenerator = {
  next: (now?: Date) => string;
};

function toDatePart(date: Date): string {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function createBookingNumberGenerator(seed = 0): BookingNumberGenerator {
  let sequence = Math.max(0, Math.floor(seed));
  let lastDate = "";

  return {
    next(now = new Date()) {
      const datePart = toDatePart(now);
      if (datePart !== lastDate) {
        lastDate = datePart;
        sequence = 0;
      }
      sequence += 1;
      const running = String(sequence).padStart(6, "0");
      return `BK-${datePart}-${running}`;
    },
  };
}

export function generateBookingNo(now = new Date()): string {
  const sequence = String(Number(String(now.getTime()).slice(-6))).padStart(6, "0");
  return `BK-${toDatePart(now)}-${sequence}`;
}

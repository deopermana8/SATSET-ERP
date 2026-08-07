import { createRuntimeRepository } from "../runtime-core/index.js";
import type { RuntimeRepository, RuntimeRequest } from "../runtime-core/index.js";
import type { BookingRecord } from "./bookingTypes.js";

export type BookingListResponse = {
  data: BookingRecord[];
  total: number;
};

export type BookingRepository = RuntimeRepository<BookingRecord> & {
  listByDateRange: (from: string, to: string) => Promise<BookingListResponse>;
};

export function createBookingRepository(request: RuntimeRequest): BookingRepository {
  const base = createRuntimeRepository<BookingRecord>("reservasi", request);

  return {
    ...base,
    async listByDateRange(from, to) {
      const payload = await request<BookingListResponse>(`/erp-wisata/reservasi?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        method: "GET",
        cacheTtlMs: 20_000,
        retries: 2,
        retryDelayMs: 150,
      });
      return payload ?? { data: [], total: 0 };
    },
  };
}

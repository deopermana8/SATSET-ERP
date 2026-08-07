import { buildBookingCalendar, buildCapacityView, buildOccupancyCalendar } from "./bookingCalendar.js";
import { buildBookingSummary, createBookingRecord, recalculateBookingTotals } from "./bookingEngine.js";
import { resolveBookingPricing } from "./bookingPricing.js";
import { buildBookingCsvReport, buildBookingReport } from "./bookingReport.js";
import { createBookingRepository } from "./bookingRepository.js";
import type {
  BookingCalendarView,
  BookingPricingRule,
  BookingRecord,
  BookingReportKey,
  BookingSummary,
  BookingValidationResult,
} from "./bookingTypes.js";
import { validateBooking } from "./bookingValidator.js";
import type { RuntimeRequest } from "../runtime-core/index.js";

export function createBookingService(request: RuntimeRequest) {
  const repository = createBookingRepository(request);

  return {
    repository,
    async load() {
      return repository.list();
    },
    async loadByDateRange(from: string, to: string) {
      return repository.listByDateRange(from, to);
    },
    validate(input: Partial<BookingRecord>, kapasitasTersedia: number): BookingValidationResult {
      return validateBooking(input, { kapasitasTersedia });
    },
    createRecord(input: Partial<BookingRecord>): BookingRecord {
      return createBookingRecord(input);
    },
    recalculateTotals(record: BookingRecord, basePrice: number, rules: BookingPricingRule[]): BookingRecord {
      const pricing = resolveBookingPricing(basePrice, record.tanggal, record.paketWisata, rules);
      return recalculateBookingTotals(record, pricing);
    },
    summarize(rows: BookingRecord[]): BookingSummary {
      return buildBookingSummary(rows);
    },
    buildCalendar(rows: BookingRecord[], from: string, to: string, kapasitas: number): BookingCalendarView {
      return buildBookingCalendar(rows, from, to, kapasitas);
    },
    buildOccupancy(rows: BookingRecord[], from: string, to: string, kapasitas: number): BookingCalendarView {
      return buildOccupancyCalendar(rows, from, to, kapasitas);
    },
    buildCapacity(rows: BookingRecord[], from: string, to: string, kapasitas: number): BookingCalendarView {
      return buildCapacityView(rows, from, to, kapasitas);
    },
    buildReport(rows: BookingRecord[], mode: BookingReportKey) {
      return buildBookingReport(rows, mode);
    },
    buildCsv(rows: BookingRecord[]) {
      return buildBookingCsvReport(rows);
    },
  };
}

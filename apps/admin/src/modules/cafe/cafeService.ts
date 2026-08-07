import type { RuntimeRequest } from "../runtime-core/index.js";
import { buildCafeDashboardSummary, buildCafeJournal, createCafeOrderFromBooking, enrichCafeKitchen } from "./cafeEngine.js";
import { createCafeOrderDraft, mergeCafeBills, recalculateCafeOrder, resumeCafeBill, splitCafeBill } from "./cafeOrder.js";
import { buildCafeCsvReport, buildCafeReport, buildCafeShiftReport } from "./cafeReport.js";
import { createCafeRepository, type CafeStorageAdapter } from "./cafeRepository.js";
import type { BookingRecord } from "../booking/bookingTypes.js";
import type { TicketRecord } from "../ticketing/ticketingTypes.js";
import { attachTicketToCafeOrder } from "./cafeEngine.js";
import type { CafeOrderRecord, CafeReportKey, CafeShiftRecord } from "./cafeTypes.js";
import { validateCafePembayaran, validateCafeRefund, validateCafeShift, validateCafeVoid, validateMergeBill, validateSplitBill } from "./cafeValidator.js";

export function createCafeService(request: RuntimeRequest, adapter: CafeStorageAdapter) {
  const repository = createCafeRepository(request, adapter);

  return {
    repository,
    loadOrders: () => repository.listOrders(),
    loadMenus: () => repository.listMenus(),
    loadShifts: () => repository.listShifts(),
    saveOrder: (order: CafeOrderRecord) => repository.saveOrder(enrichCafeKitchen(recalculateCafeOrder(order))),
    saveShift: (shift: CafeShiftRecord) => repository.saveShift(shift),
    createDraft: (kasir: string) => createCafeOrderDraft(kasir),
    fromBooking: (booking: BookingRecord, kasir: string) => createCafeOrderFromBooking(booking, kasir),
    attachTicket: (order: CafeOrderRecord, ticket: TicketRecord) => attachTicketToCafeOrder(order, ticket),
    hold: (order: CafeOrderRecord) => repository.saveOrder({ ...order, status: "Hold", diperbaruiPada: new Date().toISOString() }),
    resume: (order: CafeOrderRecord) => repository.saveOrder(resumeCafeBill(order)),
    split: (order: CafeOrderRecord, parts: number) => {
      const validation = validateSplitBill(parts);
      return validation.ok ? splitCafeBill(order, parts) : validation;
    },
    merge: (orders: CafeOrderRecord[]) => {
      const validation = validateMergeBill(orders.map((order) => order.id));
      return validation.ok ? mergeCafeBills(orders) : validation;
    },
    validatePembayaran: validateCafePembayaran,
    validateRefund: validateCafeRefund,
    validateVoid: validateCafeVoid,
    validateShift: validateCafeShift,
    summarizeDashboard: buildCafeDashboardSummary,
    report: (rows: CafeOrderRecord[], mode: CafeReportKey) => buildCafeReport(rows, mode),
    shiftReport: buildCafeShiftReport,
    exportCsv: buildCafeCsvReport,
    journal: buildCafeJournal,
  };
}

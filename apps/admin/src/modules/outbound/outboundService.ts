import type { RuntimeRequest } from "../runtime-core/index.js";
import { createOutboundDraft, recalculateOutboundTotals, summarizeOutboundDashboard } from "./outboundEngine.js";
import { buildOutboundJournalMetadata, canCreateParticipantFromBooking, recalculateOutboundRevenue } from "./outboundOperational.js";
import { createOutboundRepository, type OutboundStorageAdapter } from "./outboundRepository.js";
import { buildOutboundCsvReport, buildOutboundReport } from "./outboundReport.js";
import type { BookingRecord } from "../booking/bookingTypes.js";
import type { OutboundRecord, OutboundReportKey } from "./outboundTypes.js";

export function createOutboundService(request: RuntimeRequest, adapter: OutboundStorageAdapter) {
  const repository = createOutboundRepository(request, adapter);

  return {
    repository,
    loadRecords: () => repository.listRecords(),
    loadPackages: () => repository.listPackages(),
    loadInstructors: () => repository.listInstructors(),
    loadEquipment: () => repository.listEquipment(),
    createDraft: (name?: string) => createOutboundDraft(name),
    saveRecord: (record: OutboundRecord) => repository.saveRecord(recalculateOutboundTotals(recalculateOutboundRevenue(record))),
    deleteRecord: (id: string) => repository.deleteRecord(id),
    summarizeDashboard: summarizeOutboundDashboard,
    report: (rows: OutboundRecord[], mode: OutboundReportKey) => buildOutboundReport(rows, mode),
    exportCsv: (rows: OutboundRecord[]) => buildOutboundCsvReport(rows),
    shouldCreateFromBooking: (booking: BookingRecord) => canCreateParticipantFromBooking(booking),
    buildJournalMetadata: buildOutboundJournalMetadata,
  };
}

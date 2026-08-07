import type { OutboundAttendanceRecord, OutboundParticipant } from "./outboundTypes.js";

export function createAttendanceRecord(participant: OutboundParticipant, gate: string, petugas: string): OutboundAttendanceRecord {
  return {
    id: `${participant.id}-${Date.now()}`,
    participantId: participant.id,
    scheduleId: participant.scheduleId,
    status: "Hadir",
    checkedInAt: new Date().toISOString(),
    gate,
    petugas,
  };
}

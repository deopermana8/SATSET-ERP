import type { OutboundSession, OutboundSessionStatus } from "./outboundTypes.js";

const transitions: Record<OutboundSessionStatus, OutboundSessionStatus[]> = {
  Dijadwalkan: ["Persiapan", "Dibatalkan"],
  Persiapan: ["Berlangsung", "Dibatalkan"],
  Berlangsung: ["Selesai", "Dibatalkan"],
  Selesai: [],
  Dibatalkan: [],
};

export function canMoveOutboundSession(from: OutboundSessionStatus, to: OutboundSessionStatus): boolean {
  return transitions[from].includes(to);
}

export function moveOutboundSessionStatus(session: OutboundSession, next: OutboundSessionStatus): OutboundSession {
  if (!canMoveOutboundSession(session.status, next)) {
    return session;
  }
  const now = new Date().toISOString();
  return {
    ...session,
    status: next,
    startedAt: next === "Berlangsung" ? (session.startedAt || now) : session.startedAt,
    endedAt: next === "Selesai" ? now : session.endedAt,
  };
}

'use client';

import { useMemo } from "react";

type QrData = {
  reservationId: string;
  ticketNumber: string;
  issuedAt: string;
};

export function QrPanel() {
  const qrData = useMemo(() => {
    const data: QrData = {
      reservationId: `RES-${Date.now()}`,
      ticketNumber: `T-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`,
      issuedAt: new Date().toISOString(),
    };
    return data;
  }, []);

  const qrPayload = useMemo(() => {
    return Buffer.from(JSON.stringify(qrData)).toString("base64");
  }, [qrData]);

  const generateSimpleQR = (text: string): string[] => {
    // Simple ASCII QR representation for mock purposes
    const lines = [];
    lines.push("█".repeat(20));
    lines.push("█ " + text.substring(0, 16).padEnd(16, " ") + " █");
    lines.push("█ " + text.substring(16, 32).padEnd(16, " ") + " █");
    lines.push("█ " + text.substring(32, 48).padEnd(16, " ") + " █");
    lines.push("█".repeat(20));
    return lines;
  };

  const qrDisplay = generateSimpleQR(qrPayload.substring(0, 48));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">QR Code</p>
        <h3 className="text-2xl font-semibold text-slate-900">Kode QR check-in</h3>
        <p className="text-sm text-slate-600">Mock QR code untuk guest check-in di gate</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-500">DETAIL TIKET</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Nomor Reservasi</p>
              <p className="font-semibold text-slate-900">{qrData.reservationId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Nomor Tiket</p>
              <p className="font-semibold text-slate-900">{qrData.ticketNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Diterbitkan</p>
              <p className="font-semibold text-slate-900">{new Date(qrData.issuedAt).toLocaleString("id-ID")}</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">QR Payload</p>
              <p className="font-mono text-xs text-slate-700 break-all">{qrPayload.substring(0, 40)}...</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="mb-4 rounded-xl bg-white p-4">
            <div className="font-mono text-xs leading-tight text-slate-800">
              {qrDisplay.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Scan untuk check-in</span>
            <br />
            <span className="text-xs">Mock QR Code</span>
          </p>
        </div>
      </div>
    </section>
  );
}

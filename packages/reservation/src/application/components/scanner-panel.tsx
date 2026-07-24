'use client';

import { ChangeEvent, FormEvent, useState } from "react";

type CheckInRecord = {
  id: string;
  ticketNumber: string;
  guestName: string;
  guestCount: number;
  checkedInAt: Date;
};

type FormState = {
  qrCode: string;
  guestName: string;
  guestCount: string;
};

const initialState: FormState = {
  qrCode: "",
  guestName: "",
  guestCount: "1",
};

const labelClassName = "block text-sm font-medium text-slate-700";
const inputClassName = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-cyan-500";

export function ScannerPanel() {
  const [form, setForm] = useState<FormState>(initialState);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.qrCode.trim()) {
      setMessage({ type: "error", text: "Scan QR code terlebih dahulu" });
      return;
    }

    if (!form.guestName.trim()) {
      setMessage({ type: "error", text: "Nama tamu harus diisi" });
      return;
    }

    const guestCount = Number.parseInt(form.guestCount, 10);
    if (guestCount <= 0) {
      setMessage({ type: "error", text: "Jumlah tamu harus lebih dari 0" });
      return;
    }

    // Extract ticket number from QR payload (mock)
    const ticketMatch = form.qrCode.match(/T-[\w-]+/);
    const ticketNumber = ticketMatch ? ticketMatch[0] : `T-${Date.now().toString(36)}`;

    const newCheckIn: CheckInRecord = {
      id: `CI-${Date.now()}`,
      ticketNumber,
      guestName: form.guestName,
      guestCount,
      checkedInAt: new Date(),
    };

    setCheckIns((current) => [newCheckIn, ...current]);
    setForm(initialState);
    setMessage({ type: "success", text: `Check-in berhasil untuk ${form.guestName}` });

    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Gate Scanner</p>
        <h2 className="text-2xl font-semibold text-slate-900">Check-in tamu di gate</h2>
        <p className="text-sm text-slate-600">Form scanner QR untuk mencatat tamu yang masuk ke area wisata</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClassName}>
              QR Code / Ticket Number
              <input
                autoFocus
                className={inputClassName}
                type="text"
                value={form.qrCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("qrCode", e.target.value)}
                placeholder="Scan QR atau masukkan nomor tiket"
              />
            </label>
          </div>

          <div>
            <label className={labelClassName}>
              Nama Tamu
              <input
                className={inputClassName}
                type="text"
                value={form.guestName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("guestName", e.target.value)}
                placeholder="Contoh: Rina Putri"
              />
            </label>
          </div>

          <div>
            <label className={labelClassName}>
              Jumlah Tamu
              <input
                className={inputClassName}
                type="number"
                min="1"
                max="20"
                value={form.guestCount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("guestCount", e.target.value)}
              />
            </label>
          </div>

          <button
            className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
            type="submit"
          >
            Konfirmasi Check-In
          </button>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-4 text-sm font-semibold text-slate-700">
            Riwayat Check-In ({checkIns.length})
          </p>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {checkIns.length === 0 ? (
              <p className="text-center text-sm text-slate-500">Belum ada check-in</p>
            ) : (
              checkIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{checkIn.guestName}</p>
                      <p className="text-xs text-slate-500">{checkIn.ticketNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{checkIn.guestCount} orang</p>
                      <p className="text-xs text-slate-500">
                        {checkIn.checkedInAt.toLocaleTimeString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );

}

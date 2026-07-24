'use client';

import { ChangeEvent, FormEvent, useState } from "react";
import { Payment } from "../../domain/entities/payment";
import { ReservationId } from "../../domain/value-objects/reservation-id";

type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
};

type FormState = {
  method: string;
  amount: string;
  reference: string;
};

const paymentMethods: PaymentMethod[] = [
  { id: "transfer", name: "Transfer Bank", icon: "🏦" },
  { id: "card", name: "Kartu Kredit", icon: "💳" },
  { id: "ewallet", name: "E-Wallet", icon: "📱" },
  { id: "cash", name: "Tunai", icon: "💵" },
];

const initialState: FormState = {
  method: paymentMethods[0].id,
  amount: "505000",
  reference: "",
};

const labelClassName = "block text-sm font-medium text-slate-700";
const inputClassName = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-violet-500";
const selectClassName = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-violet-500";

export function PaymentPanel() {
  const [form, setForm] = useState<FormState>(initialState);
  const [mockPayment, setMockPayment] = useState<Payment | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedMethod = paymentMethods.find((m) => m.id === form.method) ?? paymentMethods[0];
  const amount = Number.parseInt(form.amount, 10);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (amount <= 0) {
      alert("Jumlah pembayaran harus lebih dari 0");
      return;
    }

    try {
      const payment = new Payment(`PAY-${Date.now()}`, {
        reservationId: new ReservationId(`RES-${Date.now()}`),
        amount: amount,
        method: selectedMethod.name,
        receivedAt: new Date(),
        reference: form.reference || undefined,
      });

      setMockPayment(payment);
      setSubmitted(true);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Gagal membuat pembayaran"}`);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Pembayaran</p>
        <h2 className="text-2xl font-semibold text-slate-900">Terima pembayaran reservasi</h2>
        <p className="text-sm text-slate-600">Form pembayaran dengan mock data dan domain entity integration</p>
      </div>

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className={labelClassName}>
              Metode Pembayaran
              <select className={selectClassName} value={form.method} onChange={(e) => handleChange("method", e.target.value)}>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.icon} {method.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className={labelClassName}>
              Jumlah Pembayaran
              <input
                className={inputClassName}
                type="number"
                min="1"
                value={form.amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("amount", e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <div>
            <label className={labelClassName}>
              Nomor Referensi (opsional)
              <input
                className={inputClassName}
                type="text"
                value={form.reference}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("reference", e.target.value)}
                placeholder="Contoh: TRF-123456789"
              />
            </label>
          </div>

          <button
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
            type="submit"
          >
            Konfirmasi Pembayaran
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="text-4xl">{selectedMethod.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">METODE TERPILIH</p>
              <p className="text-lg font-semibold text-slate-900">{selectedMethod.name}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Tagihan</span>
              <span className="font-semibold text-slate-900">Rp {amount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Total Pembayaran</span>
              <span className="text-lg font-semibold text-violet-600">Rp {amount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {submitted && mockPayment && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <p className="font-semibold">✓ Pembayaran berhasil</p>
              <p className="mt-1 text-xs">
                {mockPayment.method} • Rp {mockPayment.amount.toLocaleString("id-ID")}
              </p>
              {mockPayment.reference && <p className="mt-1 text-xs">Ref: {mockPayment.reference}</p>}
              <p className="mt-1 text-xs">{mockPayment.receivedAt.toLocaleString("id-ID")}</p>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

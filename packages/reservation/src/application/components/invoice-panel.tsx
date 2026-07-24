'use client';

import { useMemo, useState } from "react";
import { Invoice } from "../../domain/entities/invoice";
import { ReservationId } from "../../domain/value-objects/reservation-id";

const mockLineItems = [
  { description: "Paket Premium Escape", amount: 480000 },
  { description: "Biaya administrasi", amount: 25000 },
];

export function InvoicePanel() {
  const [mockInvoice, setMockInvoice] = useState<Invoice | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const invoice = useMemo(() => {
    if (mockInvoice) return mockInvoice;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 7);

    try {
      const newInvoice = new Invoice(`INV-${Date.now()}`, {
        reservationId: new ReservationId(`RES-${Date.now()}`),
        invoiceNumber: `INV-2048`,
        lineItems: mockLineItems,
        totalAmount: mockLineItems.reduce((sum, item) => sum + item.amount, 0),
        issuedAt: today,
        dueDate: dueDate,
        paid: false,
      });
      return newInvoice;
    } catch {
      return null;
    }
  }, [mockInvoice]);

  const handleMarkPaid = () => {
    if (invoice) {
      invoice.markPaid();
      setMockInvoice(invoice);
      setIsPaid(true);
    }
  };

  if (!invoice) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">Error: Gagal membuat invoice</p>
      </section>
    );
  }

  const statusText = isPaid || invoice.paid ? "Lunas" : "Belum dibayar";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Invoice</p>
        <h3 className="text-2xl font-semibold text-slate-900">Tagihan reservasi</h3>
        <p className="text-sm text-slate-600">Mock invoice dengan domain entity integration</p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6">
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">NOMOR INVOICE</p>
            <p className="text-lg font-semibold text-slate-900">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500">TANGGAL TERBIT</p>
            <p className="text-lg font-semibold text-slate-900">
              {invoice.issuedAt.toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">PEMESAN</p>
            <p className="mt-1 font-semibold text-slate-900">Rina Putri</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">JATUH TEMPO</p>
            <p className="mt-1 font-semibold text-slate-900">
              {invoice.dueDate.toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-500">ITEM TAGIHAN</p>
          <div className="space-y-2">
            {invoice.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.description}</span>
                <span className="font-medium text-slate-900">
                  Rp {item.amount.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
            <span>Total Tagihan</span>
            <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">STATUS PEMBAYARAN</p>
            <p className={`mt-1 font-semibold ${isPaid || invoice.paid ? "text-emerald-600" : "text-amber-600"}`}>
              {statusText}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isPaid || invoice.paid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {statusText}
          </div>
        </div>

        {!isPaid && !invoice.paid && (
          <button
            onClick={handleMarkPaid}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Tandai Sebagai Lunas
          </button>
        )}
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from "react";

type QuotationItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

const items: QuotationItem[] = [
  { id: "guide", name: "Guide lokal", qty: 1, price: 150000 },
  { id: "transport", name: "Transport wisata", qty: 1, price: 220000 },
  { id: "ticket", name: "Tiket masuk", qty: 2, price: 90000 },
];

export function QuotationPanel() {
  const [selectedDiscount, setSelectedDiscount] = useState("10");

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0), []);
  const discount = useMemo(() => subtotal * Number(selectedDiscount) / 100, [selectedDiscount, subtotal]);
  const total = useMemo(() => subtotal - discount, [discount, subtotal]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Quotation</p>
          <h3 className="text-xl font-semibold text-slate-900">Kutipan perjalanan</h3>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">Mock data</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">Qty {item.qty}</p>
              </div>
              <p className="font-semibold text-slate-700">Rp {(item.qty * item.price).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Diskon
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              value={selectedDiscount}
              onChange={(event) => setSelectedDiscount(event.target.value)}
            >
              <option value="0">0%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
            </select>
          </label>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between"><span>Diskon</span><span>- Rp {discount.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useMemo } from "react";
import { WorkflowDashboardStore } from "@satset/shared";

const store = new WorkflowDashboardStore();

const metrics = [
  { key: "reservations", label: "Reservations" },
  { key: "quotations", label: "Quotations" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "tickets", label: "Tickets" },
  { key: "checkins", label: "Check-ins" },
  { key: "cafeOrders", label: "Cafe Orders" },
  { key: "souvenirSales", label: "Souvenir Sales" },
  { key: "inventoryAdjustments", label: "Inventory" },
  { key: "financeTransactions", label: "Finance" },
  { key: "journalEntries", label: "Journals" },
] as const;

export function WorkflowDashboard() {
  const snapshot = useMemo(() => store.snapshot(), []);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Workflow Dashboard</p>
        <h2 className="text-2xl font-semibold text-slate-900">Cross-module business metrics</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{metric.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{snapshot[metric.key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";

type InventoryItemForm = {
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  warehouse: string;
  reorderPoint: number;
  lastRestockDate: Date;
};

type TransactionForm = {
  transactionType: "stock-in" | "stock-out" | "adjustment";
  itemSku: string;
  itemName: string;
  quantity: number;
  reference: string;
  notes: string;
  createdAt: Date;
  createdBy: string;
};

const mockInventory: InventoryItemForm[] = [];

export function InventoryPanel() {
  const [inventory, setInventory] = useState<InventoryItemForm[]>(mockInventory);
  const [transactions, setTransactions] = useState<TransactionForm[]>([]);
  const [selectedView, setSelectedView] = useState<"stock" | "transactions">("stock");

  const totalValue = useMemo(
    () => inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [inventory]
  );

  const needsReorder = useMemo(
    () => inventory.filter((item) => item.quantity <= item.reorderPoint),
    [inventory]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-indigo-600">
          Inventory Management
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Manajemen Persediaan
        </h2>
        <p className="text-sm text-slate-600">
          Tracking persediaan, alert reorder, dan history transaksi
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-indigo-50 p-4">
          <p className="text-xs font-semibold text-indigo-600">Total Inventory Value</p>
          <p className="text-2xl font-bold text-indigo-900">
            Rp {totalValue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs font-semibold text-orange-600">Items</p>
          <p className="text-2xl font-bold text-orange-900">{inventory.length}</p>
        </div>

        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-600">Needs Reorder</p>
          <p className="text-2xl font-bold text-red-900">{needsReorder.length}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedView("stock")}
          className="px-4 py-2 font-medium text-indigo-600"
        >
          Stock Levels
        </button>
        <button
          onClick={() => setSelectedView("transactions")}
          className="px-4 py-2 font-medium text-slate-600"
        >
          Transactions ({transactions.length})
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
        {selectedView === "stock"
          ? "Inventory siap digunakan."
          : "Belum ada transaksi."}
      </div>
    </section>
  );
}

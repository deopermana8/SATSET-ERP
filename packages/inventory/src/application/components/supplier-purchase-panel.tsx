"use client";

import { useState } from "react";

type SupplierForm = {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  bankAccount?: string;
  isActive: boolean;
};

type PurchaseLineItemForm = {
  id: string;
  itemSku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type PurchaseOrderForm = {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  lineItems: PurchaseLineItemForm[];
  totalAmount: number;
  status: "draft" | "approved" | "received" | "cancelled";
  dueDate: Date;
  receivedDate?: Date;
  notes: string;
  createdAt: Date;
};

const mockSuppliers: SupplierForm[] = [
  {
    code: "SUP001",
    name: "PT Supplier Jaya",
    contactPerson: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@supplier-jaya.com",
    address: "Jl. Merdeka No. 123",
    city: "Jakarta",
    bankAccount: "1234567890 (BCA)",
    isActive: true,
  },
  {
    code: "SUP002",
    name: "CV Distributor Sukses",
    contactPerson: "Siti Rahayu",
    phone: "0812-9876-5432",
    email: "siti@dist-sukses.com",
    address: "Jl. Ahmad Yani No. 45",
    city: "Surabaya",
    bankAccount: "9876543210 (BNI)",
    isActive: true,
  },
  {
    code: "SUP003",
    name: "Toko Grosir Maju",
    contactPerson: "Ahmad Wijaya",
    phone: "0821-5555-6666",
    email: "ahmad@toko-maju.com",
    address: "Jl. Sultan Agung No. 78",
    city: "Bandung",
    isActive: true,
  },
];

export function SupplierPurchasePanel() {
  const [suppliers] = useState<SupplierForm[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderForm[]>([]);
  const [selectedView, setSelectedView] = useState<"suppliers" | "purchase">("suppliers");

  const handleCreatePO = (supplier: SupplierForm) => {
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    const po: PurchaseOrderForm = {
      poNumber,
      supplierId: supplier.code,
      supplierName: supplier.name,
      lineItems: [
        {
          id: "item-1",
          itemSku: "INV001",
          itemName: "Beras Premium 10kg",
          quantity: 5,
          unitPrice: 75000,
          subtotal: 375000,
        },
      ],
      totalAmount: 375000,
      status: "draft",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: `Purchase order dari ${supplier.name}`,
      createdAt: new Date(),
    };

    setPurchaseOrders((current) => [po, ...current]);
    setSelectedView("purchase");
  };

  const handleApprovePO = (index: number) => {
    setPurchaseOrders((current) =>
      current.map((po, i) =>
        i === index && po.status === "draft"
          ? { ...po, status: "approved" }
          : po
      )
    );
  };

  const handleReceivePO = (index: number) => {
    setPurchaseOrders((current) =>
      current.map((po, i) =>
        i === index && po.status === "approved"
          ? { ...po, status: "received", receivedDate: new Date() }
          : po
      )
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
          Supplier & Purchase
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">
          Manajemen Supplier & Pembelian
        </h2>

        <p className="text-sm text-slate-600">
          Kelola supplier, buat purchase order, tracking penerimaan barang
        </p>
      </div>

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedView("suppliers")}
          className={`px-4 py-2 font-medium transition ${
            selectedView === "suppliers"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Suppliers ({suppliers.length})
        </button>

        <button
          onClick={() => setSelectedView("purchase")}
          className={`px-4 py-2 font-medium transition ${
            selectedView === "purchase"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
      </div>

      {selectedView === "suppliers" ? (
        <div className="grid max-h-96 gap-3 overflow-y-auto">
          {suppliers.map((supplier) => (
            <div
              key={supplier.code}
              className="rounded-lg border border-slate-200 p-4 transition hover:border-purple-300"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {supplier.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {supplier.code} • {supplier.city}
                  </p>
                </div>

                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    supplier.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {supplier.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="mb-3 grid gap-2 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    Contact
                  </p>
                  <p className="text-slate-900">
                    {supplier.contactPerson} • {supplier.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    Address
                  </p>
                  <p className="text-slate-900">
                    {supplier.address}, {supplier.city}
                  </p>
                </div>

                {supplier.bankAccount && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Bank Account
                    </p>
                    <p className="text-slate-900">
                      {supplier.bankAccount}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleCreatePO(supplier)}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700"
              >
                Create Purchase Order
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid max-h-96 gap-3 overflow-y-auto">
          {purchaseOrders.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              No purchase orders yet
            </p>
          ) : (
            purchaseOrders.map((po, idx) => (
              <div
                key={po.poNumber}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {po.poNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {po.supplierName}
                    </p>
                  </div>

                  <span
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      po.status === "draft"
                        ? "bg-slate-100 text-slate-700"
                        : po.status === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : po.status === "received"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {po.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Items
                    </p>
                    <p className="font-semibold text-slate-900">
                      {po.lineItems.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Total
                    </p>
                    <p className="font-bold text-purple-600">
                      Rp {po.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="mb-3 border-t border-slate-200 pt-3">
                  {po.lineItems.map((item) => (
                    <p key={item.id} className="text-xs text-slate-600">
                      {item.itemName}: {item.quantity} × Rp{" "}
                      {item.unitPrice.toLocaleString("id-ID")}
                    </p>
                  ))}
                </div>

                <div className="flex gap-2">
                  {po.status === "draft" && (
                    <button
                      onClick={() => handleApprovePO(idx)}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Approve
                    </button>
                  )}

                  {po.status === "approved" && (
                    <button
                      onClick={() => handleReceivePO(idx)}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Mark Received
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

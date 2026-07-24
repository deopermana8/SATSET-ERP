'use client';

import { useMemo, useState } from "react";
import type { KitchenDisplayProps } from "../../domain/entities/kitchen-display";

const mockOrders: KitchenDisplayProps[] = [
  {
    orderId: "ORD001",
    orderNumber: "001",
    tableNumber: "T-05",
    items: [
      {
        id: "item-1",
        menuItemId: "MENU001",
        menuItemName: "Nasi Goreng",
        quantity: 2,
        specialNotes: "Tidak pakai telur, extra cabai",
        prepTime: 15,
        status: "cooking",
      },
      {
        id: "item-2",
        menuItemId: "MENU005",
        menuItemName: "Kopi Espresso",
        quantity: 1,
        specialNotes: "",
        prepTime: 5,
        status: "ready",
      },
    ],
    orderTime: new Date(Date.now() - 10 * 60 * 1000),
    startCookingTime: new Date(Date.now() - 8 * 60 * 1000),
    priority: "normal",
  },
  {
    orderId: "ORD002",
    orderNumber: "002",
    tableNumber: "T-03",
    items: [
      {
        id: "item-3",
        menuItemId: "MENU002",
        menuItemName: "Mie Goreng",
        quantity: 1,
        specialNotes: "Pedas sedang",
        prepTime: 12,
        status: "pending",
      },
    ],
    orderTime: new Date(Date.now() - 3 * 60 * 1000),
    priority: "normal",
  },
  {
    orderId: "ORD003",
    orderNumber: "003",
    tableNumber: "T-01",
    items: [
      {
        id: "item-4",
        menuItemId: "MENU003",
        menuItemName: "Lumpia",
        quantity: 5,
        specialNotes: "For take away",
        prepTime: 20,
        status: "ready",
      },
    ],
    orderTime: new Date(Date.now() - 20 * 60 * 1000),
    startCookingTime: new Date(Date.now() - 18 * 60 * 1000),
    priority: "urgent",
  },
];

export function KitchenDisplayPanel() {
  const [orders, setOrders] = useState<KitchenDisplayProps[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return orders;
    return orders.filter((order) => {
      if (filterStatus === "pending") return order.items.some((item) => item.status === "pending");
      if (filterStatus === "cooking") return order.items.some((item) => item.status === "cooking");
      if (filterStatus === "ready") return order.items.every((item) => item.status === "ready");
      return true;
    });
  }, [orders, filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.items.some((i) => i.status === "pending")).length,
      cooking: orders.filter((o) => o.items.some((i) => i.status === "cooking")).length,
      ready: orders.filter((o) => o.items.every((i) => i.status === "ready")).length,
    };
  }, [orders]);

  const handleStartCooking = (orderIndex: number) => {
    const order = orders[orderIndex];
    order.items.forEach((item) => {
      if (item.status === "pending") {
        item.status = "cooking";
      }
    });
    if (!order.startCookingTime) {
      order.startCookingTime = new Date();
    }
    setOrders([...orders]);
  };

  const handleMarkReady = (orderIndex: number, itemId: string) => {
    const order = orders[orderIndex];
    const item = order.items.find((i) => i.id === itemId);
    if (item) {
      item.status = "ready";
    }
    setOrders([...orders]);
  };

  const handleCompleteOrder = (orderIndex: number) => {
    const order = orders[orderIndex];
    order.items.forEach((item) => {
      item.status = "served";
    });
    order.completedTime = new Date();
    setOrders([...orders]);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Kitchen Display System</p>
        <h2 className="text-2xl font-semibold text-slate-900">Kitchen Display</h2>
        <p className="text-sm text-slate-600">Real-time order queue untuk dapur dengan tracking waktu prep</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs font-semibold uppercase text-orange-600">Pending</p>
          <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase text-amber-600">Cooking</p>
          <p className="text-2xl font-bold text-amber-900">{stats.cooking}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-600">Ready</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.ready}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {["all", "pending", "cooking", "ready"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium transition ${
              filterStatus === status
                ? "bg-amber-600 text-white"
                : "border border-slate-300 text-slate-600 hover:border-amber-300"
            }`}
          >
            {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No orders in this status</p>
        ) : (
          filteredOrders.map((order, idx) => {
            const waitingTime = order.startCookingTime
              ? Math.floor((Date.now() - order.startCookingTime.getTime()) / 1000 / 60)
              : 0;
            const estimatedTime = Math.max(...order.items.map((item) => item.prepTime), 0);

            return (
              <div
                key={idx}
                className={`rounded-lg border-2 p-4 ${
                  order.priority === "urgent"
                    ? "border-red-400 bg-red-50"
                    : order.items.every((i) => i.status === "ready")
                      ? "border-emerald-400 bg-emerald-50"
                      : order.items.some((i) => i.status === "cooking")
                        ? "border-amber-400 bg-amber-50"
                        : "border-orange-400 bg-orange-50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">Table {order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    {order.priority === "urgent" && (
                      <span className="mb-1 block text-xs font-bold text-red-600">⚡ URGENT</span>
                    )}
                    <p className="text-sm font-semibold text-slate-900">{estimatedTime} min</p>
                    {waitingTime > 0 && (
                      <p className="text-xs text-slate-600">Waiting: {waitingTime} min</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 space-y-2 border-b border-slate-300 pb-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded px-2 py-1 text-sm ${
                        item.status === "pending"
                          ? "bg-orange-100 text-orange-900"
                          : item.status === "cooking"
                            ? "bg-amber-100 text-amber-900"
                            : item.status === "ready"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {item.quantity}× {item.menuItemName}
                        </span>
                        <span className="text-xs font-semibold">
                          {item.status === "pending"
                            ? "Pending"
                            : item.status === "cooking"
                              ? "🔥 Cooking"
                              : item.status === "ready"
                                ? "✓ Ready"
                                : "Served"}
                        </span>
                      </div>
                      {item.specialNotes && (
                        <p className="mt-1 text-xs opacity-80">Note: {item.specialNotes}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {order.items.some((i) => i.status === "pending") && (
                    <button
                      onClick={() => handleStartCooking(idx)}
                      className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.items.some((i) => i.status === "cooking") && (
                    <div className="flex gap-2 flex-1">
                      {order.items
                        .filter((i) => i.status === "cooking")
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleMarkReady(idx, item.id)}
                            className="flex-1 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            Ready: {item.menuItemName.slice(0, 8)}
                          </button>
                        ))}
                    </div>
                  )}
                  {order.items.every((i) => i.status === "ready") && (
                    <button
                      onClick={() => handleCompleteOrder(idx)}
                      className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                    >
                      Order Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

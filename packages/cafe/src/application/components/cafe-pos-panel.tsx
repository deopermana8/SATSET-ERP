'use client';

import { useMemo, useState } from "react";
import type { MenuItemProps } from "../../domain/entities/menu-item";
import { CafeOrder } from "../../domain/entities/cafe-order";
import type { CafeOrderProps, OrderLineItem } from "../../domain/entities/cafe-order";

type MenuCategory = "makanan" | "minuman" | "snack" | "dessert";

const mockMenuItems: MenuItemProps[] = [
  {
    code: "NASI001",
    name: "Nasi Goreng",
    description: "Nasi goreng spesial dengan telur dan sayuran",
    price: 35000,
    category: "makanan",
    available: true,
    prepTime: 10,
  },
  {
    code: "NASI002",
    name: "Nasi Kuning",
    description: "Nasi kuning aromatic dengan rempah pilihan",
    price: 30000,
    category: "makanan",
    available: true,
    prepTime: 8,
  },
  {
    code: "MIE001",
    name: "Mie Goreng",
    description: "Mie goreng dengan bumbu spesial",
    price: 32000,
    category: "makanan",
    available: true,
    prepTime: 9,
  },
  {
    code: "AIR001",
    name: "Iced Tea",
    description: "Es teh segar homemade",
    price: 8000,
    category: "minuman",
    available: true,
  },
  {
    code: "AIR002",
    name: "Kopi Espresso",
    description: "Kopi premium single origin",
    price: 18000,
    category: "minuman",
    available: true,
  },
  {
    code: "SNACK001",
    name: "Lumpia Goreng",
    description: "Lumpia crispy dengan dipping sauce",
    price: 12000,
    category: "snack",
    available: true,
    prepTime: 5,
  },
  {
    code: "DESSERT001",
    name: "Tiramisú",
    description: "Tiramisú homemade yang lezat",
    price: 25000,
    category: "dessert",
    available: true,
  },
];

const categories: MenuCategory[] = ["makanan", "minuman", "snack", "dessert"];

export function CafePosPanel() {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>("makanan");
  const [order, setOrder] = useState<CafeOrder | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cloneOrder = (currentOrder: CafeOrder) =>
    new CafeOrder(currentOrder.id, {
      orderNumber: currentOrder.orderNumber,
      lineItems: currentOrder.lineItems.map((lineItem) => ({ ...lineItem })),
      totalAmount: currentOrder.totalAmount,
      status: currentOrder.status as CafeOrderProps["status"],
      tableNumber: currentOrder.tableNumber,
      customerName: currentOrder.customerName,
      createdAt: currentOrder.createdAt,
    });

  const filteredItems = useMemo(
    () => mockMenuItems.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  const handleAddItem = (item: MenuItemProps) => {
    const lineItem: OrderLineItem = {
      id: `${Date.now()}-${Math.random()}`,
      menuItemId: item.code,
      menuItemName: item.name,
      quantity: 1,
      unitPrice: item.price,
      subtotal: item.price,
    };

    try {
      if (!order) {
        setOrder(
          new CafeOrder(`ORDER-${Date.now()}`, {
            orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
            lineItems: [lineItem],
            totalAmount: lineItem.subtotal,
            status: "draft",
            tableNumber: undefined,
            customerName: undefined,
            createdAt: new Date(),
          })
        );
      } else {
        const nextOrder = cloneOrder(order);
        nextOrder.addItem(lineItem);
        setOrder(nextOrder);
      }

      setMessage({ type: "success", text: `${item.name} ditambahkan` });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    }
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (!order) return;

    try {
      const nextOrder = cloneOrder(order);
      nextOrder.updateItemQuantity(menuItemId, quantity);
      setOrder(nextOrder);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    if (!order) return;

    try {
      const nextOrder = cloneOrder(order);
      nextOrder.removeItem(menuItemId);
      setOrder(nextOrder.lineItems.length > 0 ? nextOrder : null);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    }
  };

  const handleConfirmOrder = () => {
    if (!order || order.lineItems.length === 0) {
      setMessage({ type: "error", text: "Tambahkan item terlebih dahulu" });
      return;
    }

    try {
      const nextOrder = cloneOrder(order);
      nextOrder.confirm();
      setOrder(nextOrder);
      setMessage({ type: "success", text: `Pesanan ${nextOrder.orderNumber} dikonfirmasi` });
      setTimeout(() => {
        setOrder(null);
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Cafe POS</p>
        <h2 className="text-2xl font-semibold text-slate-900">Point of Sale Kafe</h2>
        <p className="text-sm text-slate-600">Sistem POS untuk manajemen pesanan kafe dengan inventory tracking</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium transition ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white"
                    : "border border-slate-300 text-slate-600 hover:border-orange-300"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <div
                key={item.code}
                className="rounded-lg border border-slate-200 p-3 hover:border-orange-300 transition"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  {item.prepTime && <p className="text-xs font-medium text-slate-500">{item.prepTime}m</p>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-600">Rp {item.price.toLocaleString("id-ID")}</span>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="rounded-lg bg-orange-600 px-3 py-1 text-sm font-medium text-white hover:bg-orange-700 transition"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-4 font-semibold text-slate-900">Keranjang Pesanan</p>

          {!order || order.lineItems.length === 0 ? (
            <p className="text-center text-sm text-slate-500">Keranjang kosong</p>
          ) : (
            <>
              <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
                {order.lineItems.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white p-2 text-sm">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="font-medium text-slate-900">{item.menuItemName}</span>
                      <button
                        onClick={() => handleRemoveItem(item.menuItemId)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.menuItemId, Number.parseInt(e.target.value, 10))}
                        className="w-12 rounded border border-slate-300 px-2 py-1 text-center text-xs"
                      />
                      <span className="text-xs text-slate-600">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="mb-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-orange-600">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  className="w-full rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 transition"
                >
                  Konfirmasi Pesanan
                </button>
              </div>
            </>
          )}

          {message && (
            <div
              className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

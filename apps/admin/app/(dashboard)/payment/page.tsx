"use client";

import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";

type PaymentRecord = {
  id: number;
  amount: number;
  method?: string | null;
  status?: string | null;
  reservation?: { id: number; code?: string | null } | null;
};

export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  const [items, setItems] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationId, setReservationId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [status, setStatus] = useState("pending");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load(){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    setLoading(true);
    const response = await fetch("/api/payment", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Gagal memuat pembayaran");
    setItems(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load().catch(() => {
      setItems([]);
      setLoading(false);
    });
  }, []);

  async function save(){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    const reservation = Number(reservationId);
    const amountValue = Number(amount);
    if (!Number.isFinite(reservation) || reservation <= 0){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      setMessage("ReservationId tidak valid");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      setMessage("Amount tidak valid");
      return;
    }

    setMessage("");
    const response = editingId
      ? await fetch(`/api/payment/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reservationId: reservation, amount: amountValue, method, status }), credentials: "same-origin" })
      : await fetch("/api/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reservationId: reservation, amount: amountValue, method, status }), credentials: "same-origin" });

    if (!response.ok){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Gagal menyimpan");
      return;
    }

    setReservationId("");
    setAmount("");
    setMethod("cash");
    setStatus("pending");
    setEditingId(null);
    await load();
  }

  async function remove(id: number){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    const response = await fetch(`/api/payment/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (!response.ok){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Gagal menghapus");
      return;
    }
    await load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>payment</h1>

      <div style={{ marginTop: 20, padding: 20, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {message ? <p style={{ color: "#dc2626", marginBottom: 12 }}>{message}</p> : null}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={reservationId} onChange={(event) => setReservationId(event.target.value)} placeholder="Reservation ID" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 140 }} />
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 120 }} />
          <select value={method} onChange={(event) => setMethod(event.target.value)} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button onClick={() => void save()}>{editingId ? "Simpan" : "Tambah Data"}</button>
          {editingId ? <button onClick={() => { setEditingId(null); setReservationId(""); setAmount(""); setMethod("cash"); setStatus("pending"); setMessage(""); }}>Batal</button> : null}
        </div>

        {loading ? <p>Memuat...</p> : null}
        {!loading && items.length === 0 ? <p>Belum ada data</p> : null}

        {!loading && items.length > 0 ? (
          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>ID</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Amount</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Status</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 8 }}>{item.id}</td>
                  <td style={{ padding: 8 }}>{item.amount}</td>
                  <td style={{ padding: 8 }}>{item.status ?? "-"}</td>
                  <td style={{ padding: 8 }}>
                    <button type="button" onClick={() => { setEditingId(item.id); setReservationId(String(item.reservation?.id ?? "")); setAmount(String(item.amount)); setMethod(item.method ?? "cash"); setStatus(item.status ?? "pending"); setMessage(""); }} style={{ marginRight: 8 }}>Edit</button>
                    <button type="button" onClick={() => void remove(item.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}


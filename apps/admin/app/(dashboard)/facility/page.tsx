"use client";

import { useEffect, useState } from "react";

type FacilityRecord = {
  id: number;
  name: string;
  destination?: { id: number; name: string } | null;
};

export default function Page() {
  const [items, setItems] = useState<FacilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/facility", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Gagal memuat fasilitas");
    setItems(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load().catch(() => {
      setItems([]);
      setLoading(false);
    });
  }, []);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Nama wajib diisi");
      return;
    }
    const destId = Number(destinationId);
    if (!Number.isFinite(destId) || destId <= 0) {
      setMessage("DestinationId tidak valid");
      return;
    }

    setMessage("");
    const response = editingId
      ? await fetch(`/api/facility/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmed, destinationId: destId }), credentials: "same-origin" })
      : await fetch("/api/facility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmed, destinationId: destId }), credentials: "same-origin" });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Gagal menyimpan");
      return;
    }

    setName("");
    setDestinationId("");
    setEditingId(null);
    await load();
  }

  async function remove(id: number) {
    const response = await fetch(`/api/facility/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Gagal menghapus");
      return;
    }
    await load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>facility</h1>

      <div style={{ marginTop: 20, padding: 20, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {message ? <p style={{ color: "#dc2626", marginBottom: 12 }}>{message}</p> : null}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, flex: 1 }} />
          <input value={destinationId} onChange={(event) => setDestinationId(event.target.value)} placeholder="Destination ID" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 140 }} />
          <button onClick={() => void save()}>{editingId ? "Simpan" : "Tambah Data"}</button>
          {editingId ? <button onClick={() => { setEditingId(null); setName(""); setDestinationId(""); setMessage(""); }}>Batal</button> : null}
        </div>

        {loading ? <p>Memuat...</p> : null}
        {!loading && items.length === 0 ? <p>Belum ada data</p> : null}

        {!loading && items.length > 0 ? (
          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>ID</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Nama</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Destination</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 8 }}>{item.id}</td>
                  <td style={{ padding: 8 }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.destination?.name ?? "-"}</td>
                  <td style={{ padding: 8 }}>
                    <button type="button" onClick={() => { setEditingId(item.id); setName(item.name); setDestinationId(String(item.destination?.id ?? "")); setMessage(""); }} style={{ marginRight: 8 }}>Edit</button>
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


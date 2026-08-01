"use client";

import { useEffect, useState } from "react";
import PermissionGuard from "@/components/auth/PermissionGuard";import { usePermission } from "@/hooks/usePermission";

type VisitorRecord = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  idCard?: string | null;
};

export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  const [items, setItems] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idCard, setIdCard] = useState("");
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
    const response = await fetch("/api/visitor", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Gagal memuat visitor");
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
    const trimmedName = name.trim();
    if (!trimmedName){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      setMessage("Nama wajib diisi");
      return;
    }

    setMessage("");
    const response = editingId
      ? await fetch(`/api/visitor/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmedName, email, phone, idCard }), credentials: "same-origin" })
      : await fetch("/api/visitor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmedName, email, phone, idCard }), credentials: "same-origin" });

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

    setName("");
    setEmail("");
    setPhone("");
    setIdCard("");
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
    const response = await fetch(`/api/visitor/${id}`, { method: "DELETE", credentials: "same-origin" });
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
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>visitor</h1>

      <div style={{ marginTop: 20, padding: 20, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {message ? <p style={{ color: "#dc2626", marginBottom: 12 }}>{message}</p> : null}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, flex: 1 }} />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 180 }} />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 120 }} />
          <input value={idCard} onChange={(event) => setIdCard(event.target.value)} placeholder="ID Card" style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6, width: 140 }} />
          <button onClick={() => void save()}>{editingId ? "Simpan" : "Tambah Data"}</button>
          {editingId ? <button onClick={() => { setEditingId(null); setName(""); setEmail(""); setPhone(""); setIdCard(""); setMessage(""); }}>Batal</button> : null}
        </div>

        {loading ? <p>Memuat...</p> : null}
        {!loading && items.length === 0 ? <p>Belum ada data</p> : null}

        {!loading && items.length > 0 ? (
          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>ID</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Nama</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Email</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 8 }}>{item.id}</td>
                  <td style={{ padding: 8 }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.email ?? "-"}</td>
                  <td style={{ padding: 8 }}>
                    <button type="button" onClick={() => { setEditingId(item.id); setName(item.name); setEmail(item.email ?? ""); setPhone(item.phone ?? ""); setIdCard(item.idCard ?? ""); setMessage(""); }} style={{ marginRight: 8 }}>Edit</button>
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



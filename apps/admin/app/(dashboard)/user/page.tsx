"use client";

import { useEffect, useState } from "react";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role?: { id: number; name: string } | null;
};

export default function Page() {
  const [items, setItems] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/user", { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("Gagal memuat user");
    }
    setItems(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load().catch(() => {
      setItems([]);
      setLoading(false);
      setMessage("Gagal memuat user");
    });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>User</h1>

      <div style={{ marginTop: 20, padding: 20, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {message ? <p style={{ color: "#dc2626", marginBottom: 12 }}>{message}</p> : null}

        {loading ? <p>Memuat...</p> : null}
        {!loading && items.length === 0 ? <p>Belum ada data</p> : null}

        {!loading && items.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>ID</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Nama</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Email</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 8 }}>{item.id}</td>
                  <td style={{ padding: 8 }}>{item.name}</td>
                  <td style={{ padding: 8 }}>{item.email}</td>
                  <td style={{ padding: 8 }}>{item.role?.name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

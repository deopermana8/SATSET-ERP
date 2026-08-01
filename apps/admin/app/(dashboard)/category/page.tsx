"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { usePermission } from "@/hooks/usePermission";

import { createCategory, deleteCategory, updateCategory } from "./actions";
import Form from "./components/Form";

type CategoryRecord = {
  id: number;
  name: string;
};

const initialState = {
  success: false,
  message: "",
};

export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const name = String(formData.get("name") ?? "").trim();
    if (!name){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      return { success: false, message: "Nama wajib diisi" };
    }

    try {
      if (editingCategory){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
        await updateCategory(editingCategory.id, { name });
        return { success: true, message: "Kategori berhasil diperbarui" };
      }

      await createCategory({ name });
      return { success: true, message: "Kategori berhasil dibuat" };
    } catch (error){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      return { success: false, message: error instanceof Error ? error.message : "Terjadi kesalahan" };
    }
  }, initialState);

  async function loadCategories(){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    const response = await fetch("/api/category", { credentials: "same-origin" });
    if (!response.ok){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      throw new Error("Gagal memuat kategori");
    }
    setCategories((await response.json()) as CategoryRecord[]);
  }

  useEffect(() => {
    void loadCategories().catch(() => {
      setCategories([]);
    });
  }, []);

  useEffect(() => {
    if (state.success){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
      void loadCategories();
      setEditingCategory(null);
    }
  }, [state.success]);

  async function handleDelete(id: number){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch {
      // Keep the current list when deletion fails.
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold" }}>Kategori</h1>

      {state.message ? <p style={{ marginTop: 12, color: state.success ? "#2563eb" : "#dc2626" }}>{state.message}</p> : null}

      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      >
        <Form
          initialData={editingCategory ? { name: editingCategory.name } : {}}
          onSubmit={(data) => {
            startTransition(() => {
              const formData = new FormData();
              formData.set("name", data.name);
              void formAction(formData);
            });
          }}
          submitLabel={isPending ? "Menyimpan..." : editingCategory ? "Simpan" : "Tambah"}
          onCancel={editingCategory ? () => setEditingCategory(null) : undefined}
        />

        <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8, textAlign: "left" }}>ID</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8, textAlign: "left" }}>Nama</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8, textAlign: "left" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td style={{ padding: 8 }}>{category.id}</td>
                <td style={{ padding: 8 }}>{category.name}</td>
                <td style={{ padding: 8 }}>
                  <button type="button" onClick={() => setEditingCategory(category)} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(category.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


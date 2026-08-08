import { useCustomer } from "../hooks/useCustomer";
import type { CustomerItem } from "../dto/CustomerDto";

interface CustomerTableProps {
  selectedCustomerId: string | null;
  onEdit: (item: CustomerItem) => void;
}

export function CustomerTable({ selectedCustomerId, onEdit }: CustomerTableProps) {
  const { listQuery, deleteMutation } = useCustomer();
  const rows = listQuery.data?.data ?? [];

  if (listQuery.isLoading) {
    return <p>Memuat data customer...</p>;
  }

  if (listQuery.isError) {
    const message = listQuery.error instanceof Error ? listQuery.error.message : "Gagal memuat data customer";
    return <p>{message}</p>;
  }

  if (rows.length === 0) {
    return <p>Belum ada customer.</p>;
  }

  const onDelete = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <section>
      <h2>Daftar Customer</h2>
      {deleteMutation.isError ? (
        <p>{deleteMutation.error instanceof Error ? deleteMutation.error.message : "Gagal menghapus customer"}</p>
      ) : null}
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Telepon</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{item.code}</td>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{item.phone ?? "-"}</td>
              <td>
                <button type="button" onClick={() => onEdit(item)}>
                  {selectedCustomerId === item.id ? "Sedang Diedit" : "Edit"}
                </button>
                <button type="button" onClick={() => void onDelete(item.id)} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

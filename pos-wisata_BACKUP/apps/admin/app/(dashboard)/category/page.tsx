export default async function Page() {
  const { data: categories, isLoading, error } = await fetchCategories();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading categories: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Category</h1>
      <div className="mt-5 p-5 bg-white rounded-lg border border-gray-300">
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Tambah Data</button>
        <CategoryTable categories={categories} />
      </div>
    </div>
  );
}

async function fetchCategories() {
  // Implement the API call to fetch categories using TanStack Query
  // This is a placeholder function
  return await fetch('/api/categories').then(res => res.json());
}

function CategoryTable({ categories }) {
  return (
    <table className="w-full mt-5">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nama</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {categories.map(category => (
          <tr key={category.id}>
            <td>{category.id}</td>
            <td>{category.name}</td>
            <td>
              <button className="text-blue-500">Edit</button> | 
              <button className="text-red-500">Hapus</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
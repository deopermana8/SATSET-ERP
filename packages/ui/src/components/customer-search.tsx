export type CustomerSearchItem = {
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
};

export type CustomerSearchProps = {
  query: string;
  results: Array<CustomerSearchItem>;
};

export function CustomerSearch({ query, results }: CustomerSearchProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Customer Search</h3>
      <p className="mt-1 text-sm text-slate-600">Query: {query}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead><tr className="text-slate-500"><th className="px-2 py-2">Code</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Phone</th></tr></thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.customerCode} className="border-t border-slate-100 text-slate-700">
                <td className="px-2 py-2 font-medium">{result.customerCode}</td>
                <td className="px-2 py-2">{result.fullName}</td>
                <td className="px-2 py-2">{result.email}</td>
                <td className="px-2 py-2">{result.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { formatCurrency, formatDate } from "./formatters";

export type JournalViewerEntry = {
  entryNumber: string;
  description: string;
  occurredAt: Date;
  totalDebit: number;
  totalCredit: number;
};

export type JournalViewerProps = {
  entries: Array<JournalViewerEntry>;
};

export function JournalViewer({ entries }: JournalViewerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">General Journal</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-2 py-2">Entry</th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Debit</th>
              <th className="px-2 py-2">Credit</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.entryNumber} className="border-t border-slate-100 text-slate-700">
                <td className="px-2 py-2 font-medium">{entry.entryNumber}</td>
                <td className="px-2 py-2">{entry.description}</td>
                <td className="px-2 py-2">{formatDate(entry.occurredAt)}</td>
                <td className="px-2 py-2">{formatCurrency(entry.totalDebit)}</td>
                <td className="px-2 py-2">{formatCurrency(entry.totalCredit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
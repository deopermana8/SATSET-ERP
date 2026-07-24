import { formatCurrency, formatDate } from "./formatters";

export type CustomerHistoryItem = {
  source: string;
  amount: number;
  visitedAt: Date;
};

export type CustomerHistoryProps = {
  visits: Array<CustomerHistoryItem>;
};

export function CustomerHistory({ visits }: CustomerHistoryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Customer History</h3>
      <ul className="mt-3 space-y-2">
        {visits.map((visit) => (
          <li key={`${visit.source}-${visit.visitedAt.toISOString()}`} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{visit.source}</p>
            <p>{formatDate(visit.visitedAt)}</p>
            <p>{formatCurrency(visit.amount)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

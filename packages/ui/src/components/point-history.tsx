import { formatDate } from "./formatters";

export type PointHistoryItem = {
  type: string;
  points: number;
  reference: string;
  occurredAt: Date;
};

export type PointHistoryProps = {
  transactions: Array<PointHistoryItem>;
};

export function PointHistory({ transactions }: PointHistoryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Point History</h3>
      <ul className="mt-3 space-y-2">
        {transactions.map((item) => (
          <li key={`${item.reference}-${item.occurredAt.toISOString()}`} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{item.type.toUpperCase()} {item.points} pts</p>
            <p>{item.reference}</p>
            <p>{formatDate(item.occurredAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

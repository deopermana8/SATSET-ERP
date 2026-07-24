import { formatCurrency } from "./formatters";

export type BalanceSheetViewProps = {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
};

export function BalanceSheetView({ totalAssets, totalLiabilities, totalEquity }: BalanceSheetViewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Balance Sheet</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Assets</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Liabilities</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalLiabilities)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Equity</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalEquity)}</p>
        </div>
      </div>
    </section>
  );
}
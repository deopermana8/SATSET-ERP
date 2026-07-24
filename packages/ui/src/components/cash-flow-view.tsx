import { formatCurrency } from "./formatters";

export type CashFlowViewProps = {
  operating: number;
  investing: number;
  financing: number;
  netChangeInCash: number;
};

export function CashFlowView({ operating, investing, financing, netChangeInCash }: CashFlowViewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Cash Flow</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Operating</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(operating)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Investing</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(investing)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Financing</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(financing)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Net Cash Movement</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(netChangeInCash)}</p>
        </div>
      </div>
    </section>
  );
}
import { formatCurrency } from "./formatters";

export type IncomeStatementViewProps = {
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
};

export function IncomeStatementView({ totalRevenue, totalExpense, netIncome }: IncomeStatementViewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Income Statement</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Revenue</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Expense</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Net Income</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(netIncome)}</p>
        </div>
      </div>
    </section>
  );
}
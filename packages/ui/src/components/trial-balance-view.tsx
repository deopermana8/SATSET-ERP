import { formatCurrency } from "./formatters";

export type TrialBalanceViewProps = {
  totalDebit: number;
  totalCredit: number;
};

export function TrialBalanceView({ totalDebit, totalCredit }: TrialBalanceViewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Trial Balance</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Total Debit</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalDebit)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Total Credit</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalCredit)}</p>
        </div>
      </div>
    </section>
  );
}
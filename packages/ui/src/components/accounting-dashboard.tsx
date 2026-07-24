import { formatCurrency } from "./formatters";

export type AccountingDashboardProps = {
  totalAccounts: number;
  postedJournals: number;
  trialBalanceDebit: number;
  trialBalanceCredit: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
};

export function AccountingDashboard(props: AccountingDashboardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Accounting Dashboard</h2>
      <p className="mt-2 text-sm text-slate-600">Operational snapshot for journal posting, ledger health, and closing readiness.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Chart Of Accounts</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{props.totalAccounts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Posted Journals</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{props.postedJournals}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Trial Debit</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(props.trialBalanceDebit)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Trial Credit</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(props.trialBalanceCredit)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Net Income</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(props.netIncome)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">Assets / Liab / Equity</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatCurrency(props.totalAssets)} / {formatCurrency(props.totalLiabilities)} / {formatCurrency(props.totalEquity)}
          </p>
        </div>
      </div>
    </section>
  );
}
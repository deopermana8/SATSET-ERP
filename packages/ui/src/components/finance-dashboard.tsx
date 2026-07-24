import { formatCurrency } from "./formatters";

export type FinanceDashboardProps = {
  totalCashAccounts: number;
  totalBankAccounts: number;
  cashTransactionCount: number;
  bankTransactionCount: number;
  expenseCount: number;
  incomeCount: number;
  transferCount: number;
  pettyCashCount: number;
  latestCashBalance: number;
};

export function FinanceDashboard(props: FinanceDashboardProps) {
  const metrics = [
    { label: "Cash Accounts", value: props.totalCashAccounts.toString() },
    { label: "Bank Accounts", value: props.totalBankAccounts.toString() },
    { label: "Cash Transactions", value: props.cashTransactionCount.toString() },
    { label: "Bank Transactions", value: props.bankTransactionCount.toString() },
    { label: "Expenses", value: props.expenseCount.toString() },
    { label: "Incomes", value: props.incomeCount.toString() },
    { label: "Transfers", value: props.transferCount.toString() },
    { label: "Petty Cash", value: props.pettyCashCount.toString() },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Finance Dashboard</h2>
      <p className="mt-2 text-sm text-slate-600">Cash, bank, expense, income, transfer, and petty cash status.</p>
      <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-xs uppercase tracking-widest text-slate-300">Latest Cash Position</p>
        <p className="mt-1 text-2xl font-semibold">{formatCurrency(props.latestCashBalance)}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-widest text-slate-500">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
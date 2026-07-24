import { formatCurrency } from "./formatters";

export type CustomerDashboardProps = {
  totalCustomers: number;
  totalVisits: number;
  totalSpending: number;
  averageSpending: number;
  activeMemberships: number;
};

export function CustomerDashboard(props: CustomerDashboardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Customer Dashboard</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total Customers</p><p className="text-lg font-semibold text-slate-900">{props.totalCustomers}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total Visits</p><p className="text-lg font-semibold text-slate-900">{props.totalVisits}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total Spending</p><p className="text-lg font-semibold text-slate-900">{formatCurrency(props.totalSpending)}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Average Spending</p><p className="text-lg font-semibold text-slate-900">{formatCurrency(props.averageSpending)}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Active Memberships</p><p className="text-lg font-semibold text-slate-900">{props.activeMemberships}</p></div>
      </div>
    </section>
  );
}

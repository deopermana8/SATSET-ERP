import { formatCurrency } from "./formatters";

export type CustomerAnalyticsProps = {
  totalVisits: number;
  totalSpending: number;
  visitFrequencyPerMonth: number;
  favoritePackage: string;
  favoriteCafeMenu: string;
  favoriteSouvenir: string;
};

export function CustomerAnalytics(props: CustomerAnalyticsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Customer Analytics</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Visit Frequency</p><p className="font-semibold">{props.visitFrequencyPerMonth.toFixed(2)} / month</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total Visits</p><p className="font-semibold">{props.totalVisits}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total Spending</p><p className="font-semibold">{formatCurrency(props.totalSpending)}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Favorite Package</p><p className="font-semibold">{props.favoritePackage}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Favorite Cafe Menu</p><p className="font-semibold">{props.favoriteCafeMenu}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Favorite Souvenir</p><p className="font-semibold">{props.favoriteSouvenir}</p></div>
      </div>
    </section>
  );
}

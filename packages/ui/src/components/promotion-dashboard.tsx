export type PromotionDashboardItem = {
  code: string;
  title: string;
  target: string;
  segment: string;
  activePeriod: string;
};

export type PromotionDashboardProps = {
  promotions: Array<PromotionDashboardItem>;
};

export function PromotionDashboard({ promotions }: PromotionDashboardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Promotion Dashboard</h3>
      <ul className="mt-3 space-y-2">
        {promotions.map((promo) => (
          <li key={promo.code} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{promo.code} - {promo.title}</p>
            <p>Target: {promo.target}</p>
            <p>Segment: {promo.segment}</p>
            <p>Period: {promo.activePeriod}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

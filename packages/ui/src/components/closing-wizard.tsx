import { formatDate } from "./formatters";

export type ClosingWizardPeriod = {
  periodId: string;
  name: string;
  status: "open" | "closed";
  closedAt?: Date;
};

export type ClosingWizardProps = {
  periods: Array<ClosingWizardPeriod>;
};

export function ClosingWizard({ periods }: ClosingWizardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Closing Wizard</h3>
      <p className="mt-1 text-sm text-slate-600">Current fiscal periods and closing status.</p>
      <ul className="mt-4 space-y-2">
        {periods.map((period) => (
          <li key={period.periodId} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{period.name}</p>
            <p>Status: {period.status}</p>
            <p>{period.closedAt ? `Closed: ${formatDate(period.closedAt)}` : "Closed: -"}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
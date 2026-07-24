import { formatCurrency } from "./formatters";

export type LedgerViewerItem = {
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
};

export type LedgerViewerProps = {
  ledgers: Array<LedgerViewerItem>;
};

export function LedgerViewer({ ledgers }: LedgerViewerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">General Ledger</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-2 py-2">Account</th>
              <th className="px-2 py-2">Debit</th>
              <th className="px-2 py-2">Credit</th>
              <th className="px-2 py-2">Closing</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((ledger) => (
              <tr key={ledger.accountCode} className="border-t border-slate-100 text-slate-700">
                <td className="px-2 py-2 font-medium">{ledger.accountCode} - {ledger.accountName}</td>
                <td className="px-2 py-2">{formatCurrency(ledger.debitTotal)}</td>
                <td className="px-2 py-2">{formatCurrency(ledger.creditTotal)}</td>
                <td className="px-2 py-2">{formatCurrency(ledger.closingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
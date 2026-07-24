import { formatCurrency } from "./formatters";

export type VoucherDashboardItem = {
  code: string;
  customerName: string;
  value: number;
  expiresAt: Date;
};

export type VoucherDashboardProps = {
  vouchers: Array<VoucherDashboardItem>;
};

export function VoucherDashboard({ vouchers }: VoucherDashboardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Voucher Dashboard</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead><tr className="text-slate-500"><th className="px-2 py-2">Code</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Value</th><th className="px-2 py-2">Expires</th></tr></thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.code} className="border-t border-slate-100 text-slate-700">
                <td className="px-2 py-2 font-medium">{voucher.code}</td>
                <td className="px-2 py-2">{voucher.customerName}</td>
                <td className="px-2 py-2">{formatCurrency(voucher.value)}</td>
                <td className="px-2 py-2">{voucher.expiresAt.toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

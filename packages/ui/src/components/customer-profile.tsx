import { formatCurrency } from "./formatters";

export type CustomerProfileProps = {
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  membershipTier: string;
  points: number;
  totalSpending: number;
};

export function CustomerProfile(props: CustomerProfileProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Customer Profile</h3>
      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p><span className="font-semibold">Code:</span> {props.customerCode}</p>
        <p><span className="font-semibold">Name:</span> {props.fullName}</p>
        <p><span className="font-semibold">Email:</span> {props.email}</p>
        <p><span className="font-semibold">Phone:</span> {props.phone}</p>
        <p><span className="font-semibold">Membership:</span> {props.membershipTier}</p>
        <p><span className="font-semibold">Points:</span> {props.points}</p>
        <p><span className="font-semibold">Total Spending:</span> {formatCurrency(props.totalSpending)}</p>
      </div>
    </section>
  );
}

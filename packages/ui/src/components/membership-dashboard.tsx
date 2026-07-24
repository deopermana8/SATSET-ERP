export type MembershipDashboardItem = {
  customerName: string;
  tierName: string;
  points: number;
};

export type MembershipDashboardProps = {
  members: Array<MembershipDashboardItem>;
};

export function MembershipDashboard({ members }: MembershipDashboardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Membership Dashboard</h3>
      <ul className="mt-3 space-y-2">
        {members.map((member) => (
          <li key={`${member.customerName}-${member.tierName}`} className="rounded-xl border border-slate-200 p-3 text-sm">
            <p className="font-semibold text-slate-900">{member.customerName}</p>
            <p className="text-slate-600">Tier: {member.tierName}</p>
            <p className="text-slate-600">Points: {member.points}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

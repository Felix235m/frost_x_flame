"use client";

const CUSTOMERS = [
  { mobile: "+91 98765 43210", name: "Rahul Sharma", village: "Navelim", visits: 12, spend: "₹3,200", noShow: 0 },
  { mobile: "+91 98765 12345", name: "Anita Desai", village: "Margao", visits: 5, spend: "₹1,250", noShow: 1 },
  { mobile: "+91 98765 67890", name: "Vikram Patel", village: "Benaulim", visits: 8, spend: "₹2,100", noShow: 0 },
];

export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Customers</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Search by mobile; view visit history</p>
        </div>
        <div className="relative w-64">
          <input
            className="w-full h-11 pl-3 pr-4 bg-obsidian-root text-on-surface rounded-lg placeholder:text-outline-variant outline-none focus:bg-surface-container-lowest shadow-inner"
            placeholder="Search by mobile number"
          />
        </div>
      </div>
      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Mobile</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Village</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider text-center">Visits</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider text-right">Spend</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider text-center">No-Shows</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {CUSTOMERS.map((c) => (
              <tr key={c.mobile} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface font-semibold tabular-nums">{c.mobile}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">{c.name}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{c.village}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant text-center">{c.visits}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface text-right tabular-nums">{c.spend}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant text-center">{c.noShow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

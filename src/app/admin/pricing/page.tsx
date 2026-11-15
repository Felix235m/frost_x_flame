"use client";

const RULES = [
  { type: "PS5", persons: 1, rate: "₹150/h" },
  { type: "PS5", persons: 2, rate: "₹250/h" },
  { type: "PS5", persons: 3, rate: "₹300/h" },
  { type: "PS5", persons: 4, rate: "₹400/h" },
  { type: "VR", persons: 1, rate: "₹300/h" },
  { type: "VR", persons: 2, rate: "₹300/h" },
  { type: "Sim", persons: 1, rate: "₹350/h" },
  { type: "Sim", persons: 2, rate: "₹350/h" },
];

export default function AdminPricingPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Pricing</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Owner-editable rates by device type and persons</p>
        </div>
      </div>
      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Device Type</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Persons</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider text-right">Rate / Hour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {RULES.map((r) => (
              <tr key={`${r.type}-${r.persons}`} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">{r.type}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{r.persons}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface font-semibold text-right tabular-nums">{r.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

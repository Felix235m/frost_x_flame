"use client";

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Reports</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Revenue, utilization, and trends (owner only)</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mb-space-lg">
        {[
          { label: "Gross Revenue", value: "₹12,450", delta: "+12% vs last week", icon: "trending_up" },
          { label: "Bookings Today", value: "24", delta: "+3 vs yesterday", icon: "event" },
          { label: "Device Utilization", value: "68%", delta: "+5% vs last week", icon: "show_chart" },
        ].map((r) => (
          <div key={r.label} className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">{r.label}</span>
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1 tabular-nums">{r.value}</span>
                <span className="font-body-sm text-body-sm text-status-available mt-0.5">{r.delta}</span>
              </div>
              <span className={`material-symbols-outlined text-[32px] ${r.icon.includes("trending") || r.icon.includes("show") ? "text-frost-cyan" : "text-on-surface-variant"}`}>{r.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4">Daily Bookings Trend</h3>
        <div className="h-48 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center justify-center">
          <span className="text-on-surface-variant font-body-sm">Chart placeholder — revenue by day</span>
        </div>
      </div>
    </div>
  );
}

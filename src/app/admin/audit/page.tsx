"use client";

const AUDIT = [
  { at: "Today 10:15 AM", staff: "Owner", action: "Created walk-in booking", entity: "Station 2 • 6:00 PM", reason: "Walk-in customer" },
  { at: "Today 9:42 AM", staff: "In-Charge", action: "Cancelled booking", entity: "#FNF-8928 • Station 1", reason: "Customer request" },
  { at: "Today 9:00 AM", staff: "Owner", action: "Updated pricing rule", entity: "PS5 2-person rate", reason: "Owner adjustment" },
  { at: "Yesterday 8:00 PM", staff: "Staff A", action: "Checked in customer", entity: "VR 1 • 7:00 PM", reason: "Session start" },
];

export default function AdminAuditPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Audit Log</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Read-only action trail (append-only)</p>
        </div>
      </div>
      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Staff</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Entity</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {AUDIT.map((a) => (
              <tr key={a.at} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant tabular-nums">{a.at}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">{a.staff}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{a.action}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{a.entity}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

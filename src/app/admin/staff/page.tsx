"use client";

import { Button } from "@/components/ui/button";

const STAFF = [
  { name: "Owner", role: "owner", status: "active", lastLogin: "Today 9:00 AM" },
  { name: "In-Charge", role: "staff", status: "active", lastLogin: "Today 8:30 AM" },
  { name: "Staff A", role: "staff", status: "active", lastLogin: "Yesterday 6:00 PM" },
];

export default function AdminStaffPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Staff</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage staff PIN profiles (owner only)</p>
        </div>
        <Button variant="flame">Add Staff</Button>
      </div>
      <div className="space-y-3">
        {STAFF.map((s) => (
          <div key={s.name} className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-frost-cyan/20 flex items-center justify-center text-frost-cyan shadow-md">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{s.name}</span>
                <span className={`font-label-badge text-label-badge text-${s.role === "owner" ? "flame-neon" : "frost-cyan"} uppercase tracking-wider`}>
                  {s.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
              <span>{s.status}</span>
              <span>{s.lastLogin}</span>
              <Button variant="outline" size="sm">Reset PIN</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";

const SETTINGS = [
  { key: "Opening Hours From", value: "12:00 PM", desc: "Cafe opening time" },
  { key: "Opening Hours To", value: "1:00 AM", desc: "Cafe closing time" },
  { key: "Hold Duration", value: "10 minutes", desc: "Unpaid hold expiry" },
  { key: "Refund Cutoff", value: "2 hours", desc: "Before slot start for refund eligibility" },
  { key: "Max Advance Days", value: "7 days", desc: "How far ahead customers can book" },
  { key: "Max Hours per Booking", value: "3 hours", desc: "Maximum session length" },
  { key: "No-Show Grace", value: "15 minutes", desc: "Grace before marking no-show" },
  { key: "Maintenance Mode", value: "Off", desc: "Shows maintenance page to customers" },
];

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Settings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Cafe configuration (owner only)</p>
        </div>
      </div>
      <div className="space-y-3">
        {SETTINGS.map((s) => (
          <div key={s.key} className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{s.key}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{s.desc}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold bg-surface-container px-3 py-1 rounded-md">{s.value}</span>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        ))}
        <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Maintenance Mode</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Customers see a friendly page; staff can still book walk-ins</span>
            </div>
            <div className="relative">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-12 h-6 rounded-full bg-surface-container-high peer-checked:bg-frost-cyan after:absolute after:left-[2px] after:top-[2px] after:after:content-[''] after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-all after:peer-checked:translate-x-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

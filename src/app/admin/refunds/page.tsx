"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const refunds = [
  { id: "1", customer: "Rahul Sharma", mobile: "+91 98765 43210", amount: "₹500", app: "PhonePe", age: "2h", booking: "#FNF-8928", status: "pending" },
  { id: "2", customer: "Anita Desai", mobile: "+91 98765 12345", amount: "₹300", app: "GPay", age: "30h", booking: "#FNF-8929", status: "pending" },
  { id: "3", customer: "Vikram Patel", mobile: "+91 98765 67890", amount: "₹600", app: "Paytm", age: "5d", booking: "#FNF-8930", status: "paid" },
];

export default function AdminRefundsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Refunds</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Track pending and paid refunds</p>
        </div>
      </div>
      <div className="flex gap-space-sm mb-space-lg">
        {["pending", "paid"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg font-body-md text-body-sm transition-colors ${
              t === "pending"
                ? "bg-status-booked/10 border border-status-booked/30 text-status-booked"
                : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({refunds.filter((r) => r.status === t).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {refunds.map((r) => (
          <div key={r.id} className={`rounded-xl p-space-md shadow-inner border border-outline-variant/10 ${r.status === "pending" && r.age.includes("h") && parseInt(r.age) > 24 ? "border-status-booked/40 bg-status-booked/5" : "bg-obsidian-card"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{r.customer}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{r.mobile}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">{r.amount}</span>
                <Badge variant={r.status === "paid" ? "available" : "held"}>{r.status}</Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">payment</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{r.app} • {r.booking}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Age: {r.age}</span>
              {r.status === "pending" && (
                <Button variant="flame" size="sm" onClick={() => {}}>
                  Mark as Refunded
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

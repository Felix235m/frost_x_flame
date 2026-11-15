"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NOTIFS = [
  { id: "1", type: "cancellation", priority: "high", time: "2 min ago", title: "Slot Cancelled — Station 2", body: "6:00 PM – 8:00 PM slot is now free. Rahul Sharma cancelled. ₹500 refund eligible.", devices: "Station 2", action: "Notify Waitlist" },
  { id: "2", type: "new_booking", priority: "normal", time: "15 min ago", title: "New Online Booking", body: "Station 3 booked for 7:00 PM – 9:00 PM by Anita Desai.", devices: "Station 3", action: "View" },
  { id: "3", type: "new_booking", priority: "normal", time: "40 min ago", title: "Walk-in Check-in", body: "VR 1 started session. Walk-in customer, 2 persons.", devices: "VR 1", action: "View" },
  { id: "4", type: "cancellation", priority: "high", time: "2 hrs ago", title: "Late Cancellation", body: "VR 2 cancelled 90 min before start. No refund eligible.", devices: "VR 2", action: "View" },
];

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<"all" | "new_booking" | "cancellation">("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const filtered = NOTIFS.filter((n) => tab === "all" || n.type === tab);
  const unacked = filtered.filter((n) => !acknowledged.has(n.id)).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Notifications Center</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">New bookings, cancellations, and priority alerts</p>
        </div>
        {unacked > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-booked text-status-booked font-heading text-label-badge font-bold">
            {unacked} Unacknowledged
          </span>
        )}
      </div>

      <div className="flex gap-space-sm mb-space-lg">
        {[
          { key: "all", label: "All" },
          { key: "new_booking", label: "New Booking" },
          { key: "cancellation", label: "Cancellation" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg font-body-md text-body-sm transition-colors ${
              tab === t.key
                ? "bg-frost-cyan text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => {
          const isHigh = n.priority === "high";
          const isAcked = acknowledged.has(n.id);
          return (
            <div
              key={n.id}
              className={`rounded-xl p-space-md border shadow-inner transition-colors ${
                isHigh
                  ? "border-status-booked/40 bg-status-booked/5"
                  : "border-outline-variant/20 bg-obsidian-card"
              } ${isAcked ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isHigh ? "bg-status-booked/20 text-status-booked" : "bg-frost-cyan/20 text-frost-cyan"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {n.type === "cancellation" ? "cancel" : "add_circle"}
                    </span>
                  </span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-label-badge text-label-badge uppercase tracking-wider ${
                        isHigh ? "text-status-booked font-bold" : "text-frost-cyan font-bold"
                      }`}>{n.type === "cancellation" ? "CANCELLATION" : "NEW BOOKING"}</span>
                      <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">{n.priority}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{n.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{n.body}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{n.time}</span>
                  {!isAcked && (
                    <Button variant="outline" size="sm" onClick={() => setAcknowledged((s) => new Set([...s, n.id]))}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
              {n.type === "cancellation" && !isAcked && (
                <div className="mt-3 pt-3 border-t border-outline-variant/20 bg-obsidian-root/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-frost-cyan">slot</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-semibold">Slot Now Free: {n.devices}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="flame" size="sm" className="flex-1" onClick={() => {}}>
                      <span className="material-symbols-outlined text-[16px]">notify</span>
                      {n.action}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAcknowledged((s) => new Set([...s, n.id]))}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

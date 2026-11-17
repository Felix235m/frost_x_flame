"use client";

import { useEffect, useState } from "react";
import { getBookingsList, getSession, type InChargeSession } from "@/lib/actions/in-charge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const KOLKATA_OFFSET = 5 * 60 + 30;

function localTime(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function BookingsPage() {
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [bookings, setBookings] = useState<{ id: string; booking_code: string; customer_id: string; source: string; status: string; start_at: string; end_at: string; hours: number; total_amount: number; customer_name: string | null; customer_mobile: string; customer_village: string | null; device_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, b] = await Promise.all([getSession(), getBookingsList(today, today)]);
        if (!mounted) return;
        setSession(s);
        setBookings(b);
      } catch {
        // handled by layout login redirect if no session
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [today]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-obsidian-root">
        <span className="material-symbols-outlined animate-spin text-frost-cyan text-[32px]">loading</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Bookings List</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            All bookings for {today}
          </p>
        </div>
        <span className="rounded-lg border border-frost-cyan/30 bg-frost-cyan/10 px-3 py-1 font-heading text-label-badge text-frost-cyan uppercase tracking-wider">
          {bookings.length}
        </span>
      </div>

      <div className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner overflow-x-auto">
        <table className="w-full text-left text-body-sm border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Code</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Customer</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Station</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Slot</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Amount</th>
              <th className="pb-2 text-label-badge uppercase tracking-wider text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                  No bookings found for {today}.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-3 font-heading text-on-surface">{b.booking_code}</td>
                  <td className="p-3">
                    <p className="font-body-sm text-body-sm text-on-surface">{b.customer_name ?? "Guest"}</p>
                    <p className="text-[10px] text-on-surface-variant">{b.customer_mobile}</p>
                  </td>
                  <td className="p-3 font-body-sm text-body-sm text-on-surface-variant">{b.device_id ?? "—"}</td>
                  <td className="p-3 font-body-sm text-body-sm text-on-surface-variant">{localTime(b.start_at)}</td>
                  <td className="p-3">
                    <Badge variant={b.status === "confirmed" ? "frost" : b.status === "checked_in" ? "available" : "held"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="p-3 font-body-sm text-body-sm text-on-surface font-bold">₹{b.total_amount}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" type="button">
                        Check-in
                      </Button>
                      {b.status === "confirmed" ? (
                        <Button variant="danger" size="sm" type="button">
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

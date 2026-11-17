"use client";

import { useEffect, useState } from "react";
import { getCancelledBookings, getSession, type InChargeSession } from "@/lib/actions/in-charge";
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

export default function CancelledPage() {
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [bookings, setBookings] = useState<{ id: string; booking_code: string; customer_id: string; source: string; status: string; start_at: string; end_at: string; hours: number; total_amount: number; customer_name: string | null; customer_mobile: string; customer_village: string | null; device_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, b] = await Promise.all([getSession(), getCancelledBookings(today, today)]);
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
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Cancelled Slot Feed</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Reverse chronological list of cancelled bookings • {today}
          </p>
        </div>
        <span className="rounded-lg border border-frost-cyan/30 bg-frost-cyan/10 px-3 py-1 font-heading text-label-badge text-frost-cyan uppercase tracking-wider">
          {bookings.length}
        </span>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-lg text-center">
            <span className="material-symbols-outlined text-[48px] text-outline block mx-auto mb-3">cancel</span>
            <h3 className="font-heading text-headline-sm font-bold text-on-surface">No cancellations today</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Cancelled slots will appear here in reverse chronological order.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="booked">Cancelled</Badge>
                  <span className="font-heading text-headline-sm font-bold text-on-surface">{b.booking_code}</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{localTime(b.start_at)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-body-sm mb-3">
                <div className="rounded-lg border border-border-subtle bg-surface-container p-2">
                  <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Station</p>
                  <p className="font-body-sm text-body-sm text-on-surface">{b.device_id ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-container p-2">
                  <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Customer</p>
                  <p className="font-body-sm text-body-sm text-on-surface truncate">{b.customer_name ?? "Guest"}</p>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-container p-2">
                  <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Amount</p>
                  <p className="font-body-sm text-body-sm text-on-surface font-bold">₹{b.total_amount}</p>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-container p-2">
                  <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Refund</p>
                  <p className="font-body-sm text-body-sm text-on-surface font-bold text-status-available">Pending</p>
                </div>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" type="button">
                  Release to Floor
                </Button>
                <Button variant="default" size="sm" className="flex-1" type="button">
                  Refund Done
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

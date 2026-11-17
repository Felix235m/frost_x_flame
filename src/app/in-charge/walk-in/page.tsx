"use client";

import { useState, useEffect } from "react";
import { createWalkInBooking, getDevices, getSession, getVillages, type InChargeSession } from "@/lib/actions/in-charge";
import { WalkInForm } from "@/components/in-charge/WalkInForm";
import { CancelConfirmModal } from "@/components/in-charge/CancelConfirmModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function WalkInPage() {
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [devices, setDevices] = useState<{ id: string; name: string; type: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ device_id: string; start: string; hours: number; amount: number } | null>(
    null,
  );
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, d, v] = await Promise.all([getSession(), getDevices(), getVillages()]);
        if (!mounted) return;
        setSession(s);
        setDevices(d.map((x) => ({ id: x.id, name: x.name, type: x.type })));
        setVillages(v);
      } catch {
        setError("Unable to load stations. Try again.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBook = async (payload: {
    device_id: string;
    persons: number;
    hours: number;
    start: string;
    mobile: string;
    name: string | null;
    village: string | null;
  }) => {
    setError("");
    if (!session) {
      setError("Session expired. Please log in again.");
      return;
    }
    try {
      const result = await createWalkInBooking(payload, session.staff_id);
      if (result.ok) {
        setBookingCode(result.booking_code ?? null);
        setFormOpen(false);
      } else {
        setError(result.error ?? "Booking failed.");
      }
    } catch {
      setError("Booking failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Walk-in Quick Book</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Counter booking for walk-in customers. Confirmed and locked on submit.
          </p>
        </div>
        <Button variant="flame" onClick={() => setFormOpen(true)}>
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Walk-in
        </Button>
      </div>

      {devices.length > 0 && (
        <div className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">Station</span>
              <span className="text-body-sm text-on-surface font-semibold">{devices[0].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">Source</span>
              <Badge variant="frost">Walk-in</Badge>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} disabled={formOpen}>
              Book Walk-in
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-status-booked/30 bg-status-booked/10 px-3 py-2 text-body-sm text-status-booked">
          {error}
        </div>
      )}

      {bookingCode && (
        <div className="rounded-xl border border-frost-cyan/30 bg-frost-cyan/10 p-space-sm shadow-[0_0_24px_rgba(0,229,255,0.2)]">
          <h3 className="font-heading text-headline-sm font-bold text-frost-cyan">Booking Confirmed</h3>
          <p className="font-body-sm text-body-sm text-on-surface mt-1">
            Booking code <span className="font-heading text-on-surface font-bold">{bookingCode}</span> has been locked for the customer.
          </p>
          <Button variant="default" className="mt-3" onClick={() => setBookingCode(null)} type="button">
            Done
          </Button>
        </div>
      )}

      <WalkInForm
        open={formOpen}
        devices={devices}
        onSubmit={handleBook}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { lookupBooking } from "@/lib/actions/bookings";
import { CustomerLayout } from "@/components/customer/layout";

type StatusVariant = "held" | "confirmed" | "checked_in" | "completed" | "cancelled" | "expired" | "no_show";

const STATUS_CONFIG: Record<string, { label: string; variant: string; color: string }> = {
  held: { label: "HELD", variant: "held", color: "status-held" },
  confirmed: { label: "CONFIRMED", variant: "available", color: "status-available" },
  checked_in: { label: "CHECKED IN", variant: "available", color: "status-available" },
  completed: { label: "COMPLETED", variant: "tertiary", color: "on-surface" },
  cancelled: { label: "CANCELLED", variant: "booked", color: "status-booked" },
  expired: { label: "EXPIRED", variant: "booked", color: "status-booked" },
  no_show: { label: "NO SHOW", variant: "booked", color: "status-booked" },
};

export default function ManagePage() {
  const [bookingCode, setBookingCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<{ ok: boolean; data?: any; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await lookupBooking(bookingCode.trim(), mobile.trim());
      setResult(res);
    } catch {
      setResult({ ok: false, error: "Failed to look up booking" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!result?.data) return;
    if (!window.confirm("Cancel this booking? A refund will be processed if eligible.")) return;
    setLoading(true);
    try {
      const res = await (window as any).cancelBooking?.(result.data.booking_id, null, "customer", "Customer self-service cancellation");
      if (res?.ok) {
        setResult({ ok: true, data: { ...result.data, status: "cancelled" } });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="flex flex-col h-full">
        <section className="w-full max-w-md mx-auto">
          {/* Lookup card */}
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-4 mb-space-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Manage Your Booking</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Look up your booking with your ticket reference and mobile number.
            </p>
            <form onSubmit={handleLookup} className="space-y-3">
              <div className="space-y-1">
                <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block">Booking ID (#FNF-8924)</label>
                <input
                  className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg px-3.5 text-body-md font-body-md outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                  placeholder="Enter booking ID"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  type="text"
                />
              </div>
              <div className="space-y-1 relative">
                <span className="absolute left-3 font-body-md text-body-md font-semibold text-on-surface-variant select-none">+91</span>
                <input
                  className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg pl-14 pr-11 text-body-md font-body-md font-semibold outline-none focus:bg-surface-container-lowest tracking-wider shadow-inner"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  type="tel"
                  disabled={loading}
                />
              </div>
              <Button variant="flame" className="w-full" type="submit" disabled={loading || !bookingCode || !mobile}>
                {loading ? "Looking up..." : "View Booking"}
              </Button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-xl p-space-md shadow-md space-y-4 ${result.ok ? "bg-obsidian-card border border-outline-variant/50" : "bg-status-booked/10 border border-status-booked/30"}`}>
              {!result.ok && (
                <div className="flex flex-col items-center gap-space-sm text-center py-4">
                  <span className="material-symbols-outlined text-status-booked text-[48px]">error</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Booking Not Found</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Please check your booking ID and mobile number and try again.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
                    Try Again
                  </Button>
                </div>
              )}
              {result.ok && result.data && (
                <div>
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STATUS_CONFIG[result.data.status]?.color === "status-available" ? "bg-status-available/20 text-status-available" : STATUS_CONFIG[result.data.status]?.color === "status-held" ? "bg-status-held/20 text-status-held" : "bg-surface-container-high text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">{result.data.booking_code}</span>
                        <Badge variant={STATUS_CONFIG[result.data.status]?.variant as any}>{STATUS_CONFIG[result.data.status]?.label}</Badge>
                      </div>
                    </div>
                    <span className="font-label-badge text-label-badge text-frost-cyan uppercase tracking-wider">₹{result.data.total_amount}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Session</span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold">{new Date(result.data.start_at).toLocaleDateString("en-IN")}</span>
                      <span className="font-body-sm text-body-sm text-frost-cyan">{new Date(result.data.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(result.data.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Gamer</span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold">{result.data.customer_name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{result.data.customer_mobile}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant mb-2">Stations</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.data.items.map((item: any, i: number) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-obsidian-root border border-outline-variant/30 text-on-surface-variant font-body-sm text-body-sm">
                          {item.device_name} • {item.persons}P • {item.hours}h
                        </div>
                      ))}
                    </div>
                  </div>
                  {result.data.refund_eligible !== undefined && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30">
                      <div className="flex items-center justify-between">
                        <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Refund Eligible</span>
                        <Badge variant={result.data.refund_eligible ? "available" : "booked"}>
                          {result.data.refund_eligible ? "YES" : "NO"}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => router?.push(`/customer/confirmation/${result.data.booking_code}`)}>
                      View Pass
                    </Button>
                    {result.data.status === "confirmed" && result.data.refund_eligible && (
                      <Button variant="danger" className="flex-1" onClick={handleCancel} disabled={loading}>
                        Cancel & Refund
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </CustomerLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getBookingsList, cancelBooking, getSession, type CancelResult, type InChargeSession } from "@/lib/actions/in-charge";
import { CancelConfirmModal } from "@/components/in-charge/CancelConfirmModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const KOLKATA_OFFSET = 5 * 60 + 30;

function localTime(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function CancelPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [booking, setBooking] = useState<{ id: string; booking_code: string; customer_id: string; source: string; status: string; start_at: string; end_at: string; hours: number; total_amount: number; customer_name: string | null; customer_mobile: string; customer_village: string | null; device_id?: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!bookingId) return;
      try {
        const [s, list] = await Promise.all([
          getSession(),
          getBookingsList(new Date().toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)),
        ]);
        if (!mounted) return;
        setSession(s);
        setBooking(list.find((x) => x.id === bookingId) ?? null);
      } catch {
        setError("Unable to load booking.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const handleCancel = async (reason: string, refund: boolean) => {
    setLoading(true);
    try {
      const result: CancelResult = await cancelBooking(bookingId, session?.staff_id ?? null, reason);
      if (result.ok) {
        setModalOpen(false);
        router.replace("/in-charge/cancelled");
        router.refresh();
      } else {
        setError(result.error ?? "Cancellation failed.");
      }
    } catch {
      setError("Cancellation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-obsidian-root">
        <span className="material-symbols-outlined animate-spin text-frost-cyan text-[32px]">loading</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-obsidian-root px-4 py-8">
        <div className="text-center">
          <h1 className="font-heading text-headline-md font-bold text-on-surface">Booking not found</h1>
          <Link href="/in-charge/cancelled">
            <Button variant="default" type="button">Back to Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <Link href="/in-charge/cancelled">
          <Button variant="ghost" size="sm" type="button">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Feed
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Cancel Booking</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{booking.booking_code}</p>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading text-headline-sm font-bold text-on-surface">Station & Customer</span>
          <Badge variant={booking.status === "confirmed" ? "frost" : "held"}>{booking.status}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-body-sm">
          <div className="rounded-lg border border-border-subtle bg-surface-container p-3">
            <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Station</p>
            <p className="font-body-sm text-body-sm text-on-surface">{booking.device_id ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-container p-3">
            <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Customer</p>
            <p className="font-body-sm text-body-sm text-on-surface">{booking.customer_name ?? "Guest"}</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-container p-3">
            <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Slot</p>
            <p className="font-body-sm text-body-sm text-on-surface">{localTime(booking.start_at)}</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-container p-3">
            <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">Paid</p>
            <p className="font-body-sm text-body-sm text-on-surface font-bold">₹{booking.total_amount}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <p className="text-body-sm text-body-sm text-on-surface-variant mb-2">
            Cancelling more than 2 hours before the slot start qualifies for a full refund.
          </p>
          <Button variant="flame" className="w-full" onClick={() => setModalOpen(true)} type="button">
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            Confirm Cancellation
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-status-booked/30 bg-status-booked/10 px-3 py-2 text-body-sm text-status-booked">
          {error}
        </div>
      )}

      {booking && (
        <CancelConfirmModal
          open={modalOpen}
          bookingCode={booking.booking_code}
          station={booking.device_id ?? "—"}
          slotTime={localTime(booking.start_at)}
          amount={booking.total_amount}
          onConfirm={handleCancel}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CancelConfirmModalProps {
  open: boolean;
  bookingCode: string;
  station: string;
  slotTime: string;
  amount: number;
  onConfirm: (reason: string, refund: boolean) => void;
  onClose: () => void;
}

const REASONS = [
  { value: "customer_called", label: "Customer called" },
  { value: "emergency", label: "Emergency" },
  { value: "hardware_issue", label: "Hardware issue" },
  { value: "other", label: "Other" },
];

export function CancelConfirmModal({
  open,
  bookingCode,
  station,
  slotTime,
  amount,
  onConfirm,
  onClose,
}: CancelConfirmModalProps) {
  const [reason, setReason] = useState<string>("");
  const [refund, setRefund] = useState(true);
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={cn(
          "bg-obsidian-elevated rounded-2xl p-space-lg shadow-2xl max-w-md w-full border border-border-glow-flame/50 animate-in fade-in zoom-in duration-300",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-headline-md font-bold text-on-surface">Cancel Booking</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:text-frost-cyan transition-colors" type="button">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Booking Code</span>
            <span className="font-heading text-on-surface font-bold">{bookingCode}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Station</span>
            <span className="font-heading text-on-surface">{station}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Slot</span>
            <span className="font-heading text-on-surface">{slotTime}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Paid Amount</span>
            <span className={`font-heading text-on-surface font-bold ${refund ? "text-frost-cyan" : "text-on-surface-variant"}`}>
              ₹{amount}
            </span>
          </div>

          <div className="pt-2 border-t border-outline-variant/20">
            <label className="mb-2 block text-label-badge uppercase tracking-wider text-on-surface-variant">
              Cancellation Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-body-sm text-on-surface-variant transition-colors",
                    reason === r.value
                      ? "border-frost-cyan bg-frost-cyan/10 text-frost-cyan"
                      : "border-border-subtle hover:border-frost-cyan/60"
                  )}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-body-sm text-on-surface-variant">
              <input
                checked={refund}
                onChange={() => setRefund(!refund)}
                type="checkbox"
                className="rounded border-border-subtle bg-obsidian-root text-frost-cyan focus:ring-frost-cyan"
              />
              <span>Authorize full refund (eligible if &gt;2 hrs before start)</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="mb-1 block text-label-badge uppercase tracking-wider text-on-surface-variant">
              Staff Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => onConfirm(reason || "other", refund)}
            disabled={!reason}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
}

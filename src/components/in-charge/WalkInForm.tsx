"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WalkInFormProps {
  open: boolean;
  devices: { id: string; name: string; type: string }[];
  onSubmit: (payload: {
    device_id: string;
    persons: number;
    hours: number;
    start: string;
    mobile: string;
    name: string | null;
    village: string | null;
  }) => void;
  onClose: () => void;
  prefill?: { device_id: string; start: string; hours: number; amount: number };
}

export function WalkInForm({
  open,
  devices,
  onSubmit,
  onClose,
  prefill,
}: WalkInFormProps) {
  const [step, setStep] = useState(1);
  const [deviceId, setDeviceId] = useState(prefill?.device_id ?? devices[0]?.id ?? "");
  const [persons, setPersons] = useState(1);
  const [hours, setHours] = useState(prefill?.hours ?? 1);
  const [start, setStart] = useState(prefill?.start ?? new Date().toISOString().slice(0, 16));
  const [pricePerHour, setPricePerHour] = useState((prefill?.amount ?? 0) / Math.max(prefill?.hours ?? 1, 1));
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [whatsapp, setWhatsapp] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const total = pricePerHour * hours;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!deviceId || !mobile) {
      setError("Please fill in station and customer mobile.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      onSubmit({
        device_id: deviceId,
        persons,
        hours,
        start,
        mobile,
        name: name || null,
        village: village || null,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className={cn("bg-obsidian-elevated rounded-2xl p-space-lg shadow-2xl max-w-lg w-full border border-border-subtle animate-in fade-in zoom-in duration-300", open ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-headline-md font-bold text-on-surface">Walk-in Quick Book</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:text-frost-cyan transition-colors" type="button">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="flex w-full justify-between text-body-sm text-on-surface-variant font-heading text-label-badge uppercase tracking-wider mb-4">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "flex flex-col items-center gap-1",
                step === n ? "text-frost-cyan font-bold" : "text-on-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                {step === n ? "radio_button_checked" : "radio_button_unchecked"}
              </span>
              <span>{n === 1 ? "Station" : n === 2 ? "Customer" : "Payment"}</span>
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-2 block text-label-badge uppercase tracking-wider text-on-surface-variant">Station</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {devices.map((d) => {
                    const active = deviceId === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDeviceId(d.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                          active
                            ? "border-frost-cyan bg-frost-cyan/10 text-frost-cyan"
                            : "border-border-subtle bg-surface-container-low text-on-surface-variant hover:border-frost-cyan/60"
                        )}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {d.type === "ps5" ? "videogame_asset" : d.type === "vr" ? "view_in_ar" : "sports_score"}
                        </span>
                        <span className="font-body-sm text-body-sm font-semibold">{d.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Date & Time</label>
                  <input
                    className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Duration (hrs)</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHours(Math.max(1, hours - 1))}
                      className="rounded-lg p-1.5 text-on-surface hover:text-frost-cyan transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container font-heading text-label-timer text-on-surface">
                      {hours}
                    </span>
                    <button
                      onClick={() => setHours(hours + 1)}
                      className="rounded-lg p-1.5 text-on-surface hover:text-frost-cyan transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface">Estimated price</span>
                <span className="font-heading text-headline-sm text-frost-cyan font-bold">₹{total}</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Mobile (+91)</label>
                  <input
                    className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => {
                      setError("");
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Name</label>
                  <input
                    className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                    placeholder="Rahul"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Village</label>
                <input
                  className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                  placeholder="Village name"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="mb-2 block text-label-badge uppercase tracking-wider text-on-surface-variant">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {["cash", "upi", "gpay", "phonepe"].map((m) => {
                    const active = paymentMode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setPaymentMode(m)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center transition-colors",
                          active
                            ? "border-frost-cyan bg-frost-cyan/10 text-frost-cyan"
                            : "border-border-subtle bg-surface-container-low text-on-surface-variant hover:border-frost-cyan/60"
                        )}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {m === "cash" ? "payments" : m === "upi" ? "qr_code" : m === "gpay" ? "g_mobiledata" : "smartphone"}
                        </span>
                        <span className="font-body-sm text-body-sm font-semibold">{m.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  checked={whatsapp}
                  id="whatsapp"
                  onChange={() => setWhatsapp(!whatsapp)}
                  type="checkbox"
                  className="rounded border-border-subtle bg-obsidian-root text-frost-cyan focus:ring-frost-cyan"
                />
                <label htmlFor="whatsapp" className="text-body-sm text-on-surface-variant cursor-pointer">
                  WhatsApp opt-in (slip via WhatsApp)
                </label>
              </div>
              <div className="pt-3 border-t border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Station & Duration</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{hours} hr</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Rate / hr</span>
                  <span className="font-body-sm text-body-sm text-on-surface">₹{pricePerHour}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface font-semibold">
                  <span>Total</span>
                  <span className="font-heading text-frost-cyan font-bold">₹{total}</span>
                </div>
              </div>
            </>
          )}

          {error ? (
            <p className="rounded-lg border border-status-booked/30 bg-status-booked/10 px-3 py-2 text-body-sm text-status-booked">{error}</p>
          ) : null}

          <div className="mt-6 flex gap-2">
            {step > 1 && (
              <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)} type="button">
                Back
              </Button>
            )}
            <Button
              variant={step === 3 ? "flame" : "default"}
              className="flex-1"
              disabled={isLoading}
              onClick={() => {
                if (step === 3) {
                  handleSubmit(new Event("submit") as unknown as React.FormEvent);
                } else {
                  setStep(step + 1);
                }
              }}
              type="button"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : step === 3 ? (
                "Confirm & Lock Slot"
              ) : (
                step === 1 ? "Next: Customer" : "Next: Payment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

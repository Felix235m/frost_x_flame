"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/customer/layout";
import { BookingHeader } from "@/components/customer/booking-header";
import { cn } from "@/lib/utils";
import {
  formatLongDate,
  getTier,
  hourLabelLong,
  rangeLabel,
  type Station,
} from "@/lib/content/booking";

const UPI_APPS = [
  { id: "PhonePe", label: "PhonePe", subtitle: "Fastest", icon: "payments", tone: "bg-[#5f259f]/20 text-[#a770ef]" },
  { id: "Google Pay", label: "GPay", subtitle: "Instant", icon: "qr_code_scanner", tone: "bg-surface-container text-frost-sky" },
  { id: "Paytm", label: "Paytm UPI", subtitle: "Wallet / UPI", icon: "account_balance", tone: "bg-surface-container text-frost-cyan" },
  { id: "UPI QR", label: "Any UPI", subtitle: "Scan cafe QR", icon: "qr_code_2", tone: "bg-surface-container text-flame-neon" },
];

const LOCALITIES = ["Navelim", "Margao", "Benaulim", "Fatorda", "Chinchinim"];

const HOLD_SECONDS = 10 * 60;

export interface CheckoutScreenProps {
  station: Station;
  players: number;
  hours: number;
  startHour: number;
  date: string;
  /** Resolved on the server so no client render reads the clock. */
  isToday: boolean;
}

export function CheckoutScreen({
  station,
  players,
  hours,
  startHour,
  date,
  isToday,
}: CheckoutScreenProps) {
  const router = useRouter();
  const tier = getTier(station.type, players);
  const total = tier.ratePerHour * hours;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [selectedUpi, setSelectedUpi] = useState(UPI_APPS[0].id);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    if (secondsLeft <= 0 || status !== "idle") return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, status]);

  const holdExpired = secondsLeft <= 0;
  const timerDisplay = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60
  ).padStart(2, "0")}`;

  const phoneValid = phone.length === 10;
  const canPay = phoneValid && name.trim().length > 2 && !holdExpired && status === "idle";

  const refundCutoff = useMemo(() => {
    const cutoffHour = Math.max(startHour - 2, 0);
    return `${hourLabelLong(cutoffHour)} ${isToday ? "today" : `on ${formatLongDate(date)}`}`;
  }, [date, isToday, startHour]);

  const handlePay = () => {
    if (!canPay) return;
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      router.push("/customer/confirmation/FNF-8924");
    }, 1200);
  };

  return (
    <CustomerLayout variant="focused">
      <BookingHeader backHref={`/customer/booking/${station.id}`} title="Session Checkout" />

      <main className="mx-auto w-full max-w-app px-4 pt-16 pb-36 md:px-10">
        <div className="flex flex-col gap-4 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="flex flex-col gap-4">
            {/* Hold countdown */}
            <section className="relative overflow-hidden rounded-xl bg-obsidian-elevated p-4 shadow-lg">
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-status-held/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-frost-cyan/10 blur-2xl" />
              <div className="relative z-10 mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-held opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-held" />
                  </span>
                  <span className="font-heading text-label-action uppercase tracking-wider text-status-held">
                    Slots locked for you
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-obsidian-root px-2.5 py-1 shadow-inner">
                  <span
                    className="material-symbols-outlined animate-spin text-[16px] text-status-held"
                    style={{ animationDuration: "4s" }}
                  >
                    hourglass_top
                  </span>
                  <span
                    className={cn(
                      "font-heading text-label-timer font-bold tracking-widest tabular-nums",
                      holdExpired ? "text-status-booked" : "text-status-held"
                    )}
                  >
                    {timerDisplay}
                  </span>
                </div>
              </div>
              <p className="relative z-10 text-body-sm text-on-surface-variant">
                To prevent double bookings,{" "}
                <strong className="font-semibold text-frost-cyan">{station.code}</strong> is reserved
                exclusively while you pay.
              </p>
            </section>

            {/* Summary */}
            <section className="rounded-xl bg-obsidian-elevated p-4 shadow-md">
              <div className="flex items-start justify-between gap-2 rounded-lg bg-obsidian-root/60 p-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-frost-cyan/15 px-2 py-0.5 text-label-badge uppercase tracking-wider text-frost-cyan">
                      {station.typeLabel}
                    </span>
                    <span className="flex items-center gap-0.5 rounded-full bg-surface-container px-2 py-0.5 text-label-badge text-on-surface-variant">
                      <span className="material-symbols-outlined text-[13px]">sports_esports</span>
                      {players} {players === 1 ? "Player" : "Players"}
                    </span>
                  </div>
                  <h2 className="font-heading text-headline-md font-bold tracking-tight text-on-surface">
                    Station: {station.code}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-frost-sky">
                      calendar_today
                    </span>
                    <span>{formatLongDate(date)}</span>
                    <span className="text-outline-variant">•</span>
                    <span className="material-symbols-outlined text-[16px] text-flame-amber">
                      schedule
                    </span>
                    <span>
                      {rangeLabel(startHour, hours)} ({hours}h)
                    </span>
                  </div>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-high">
                  <span
                    className="material-symbols-outlined text-[28px] text-frost-cyan"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    videogame_asset
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 pt-3 text-body-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>
                    Base slot fee ({tier.label}, {hours} {hours === 1 ? "hour" : "hours"})
                  </span>
                  <span className="font-medium text-on-surface">₹{total}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Convenience &amp; UPI charge
                    <span className="rounded bg-tertiary-container/20 px-1.5 py-0.5 text-label-badge text-tertiary-container">
                      Free
                    </span>
                  </span>
                  <span className="font-medium text-tertiary">₹0</span>
                </div>
                <div className="flex items-baseline justify-between rounded-lg bg-obsidian-root/40 px-3 py-2 pt-2">
                  <span className="font-heading text-headline-sm font-semibold text-on-surface">
                    Total payable
                  </span>
                  <span className="font-heading text-headline-lg-mobile font-bold text-frost-cyan tabular-nums">
                    ₹{total}
                  </span>
                </div>
              </div>
            </section>

            {/* Gamer details */}
            <section className="rounded-xl bg-obsidian-elevated p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                    Gamer details
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    No account needed. Quick instant confirmation.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[22px] text-frost-cyan">
                  flash_on
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5">
                <span className="material-symbols-outlined text-[18px] text-frost-cyan">badge</span>
                <p className="text-body-sm leading-snug text-on-surface-variant">
                  Returning gamer? Enter your{" "}
                  <strong className="font-semibold text-on-surface">10-digit number</strong> to
                  auto-fill.
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-label-badge uppercase tracking-wider text-on-surface-variant"
                    htmlFor="gamer-name"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <input
                      className="h-12 w-full rounded-lg bg-obsidian-root px-3.5 pl-11 text-body-md text-on-surface shadow-inner transition-colors placeholder:text-outline focus:bg-surface-container-lowest focus:outline-hidden"
                      id="gamer-name"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      type="text"
                      value={name}
                    />
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-outline-variant">
                      person
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-label-badge uppercase tracking-wider text-on-surface-variant"
                      htmlFor="gamer-phone"
                    >
                      Mobile number
                    </label>
                    <span className="flex items-center gap-1 text-[11px] text-tertiary">
                      <span
                        className="material-symbols-outlined text-[13px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        chat
                      </span>
                      WhatsApp e-ticket
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-body-md font-semibold text-on-surface-variant select-none">
                      +91
                    </span>
                    <input
                      className="h-12 w-full rounded-lg bg-obsidian-root pr-11 pl-14 text-body-md font-semibold tracking-wider text-on-surface shadow-inner transition-colors placeholder:text-outline focus:bg-surface-container-lowest focus:outline-hidden"
                      id="gamer-phone"
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(event) =>
                        setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="98765 43210"
                      type="tel"
                      value={phone}
                    />
                    {phoneValid ? (
                      <span
                        className="material-symbols-outlined absolute right-3 text-[20px] text-status-available"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <label
                    className="text-label-badge uppercase tracking-wider text-on-surface-variant"
                    htmlFor="gamer-locality"
                  >
                    Locality / village
                  </label>
                  <div className="relative">
                    <input
                      className="h-11 w-full rounded-lg bg-obsidian-root px-3.5 pl-10 text-body-md text-on-surface shadow-inner placeholder:text-outline focus:outline-hidden"
                      id="gamer-locality"
                      onChange={(event) => setLocality(event.target.value)}
                      placeholder="Select or enter locality"
                      type="text"
                      value={locality}
                    />
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline-variant">
                      location_on
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {LOCALITIES.map((option) => {
                      const active = option === locality;
                      return (
                        <button
                          key={option}
                          aria-pressed={active}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-body-sm font-medium transition-transform active:scale-95",
                            active
                              ? "bg-frost-cyan text-obsidian-root"
                              : "bg-surface-container-high text-on-surface hover:text-frost-cyan"
                          )}
                          onClick={() => setLocality(option)}
                          type="button"
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* UPI */}
            <section className="rounded-xl bg-obsidian-elevated p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                    Select UPI app
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">Instant one-tap checkout</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-tertiary">
                  account_balance_wallet
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-lg bg-obsidian-root px-3 py-2">
                <span
                  className="material-symbols-outlined text-[18px] text-status-available"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-badge text-on-surface">
                    Frost x Flame Gaming Cafe
                  </p>
                  <p className="truncate font-mono text-[11px] text-outline">
                    frostxflame@icici • Verified merchant
                  </p>
                </div>
                <span className="rounded bg-tertiary/10 px-1.5 py-0.5 text-label-badge text-tertiary">
                  0% fee
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {UPI_APPS.map((app) => {
                  const active = app.id === selectedUpi;
                  return (
                    <button
                      key={app.id}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-3 text-left transition-all active:scale-[0.98]",
                        active ? "bg-surface-container-high" : "bg-obsidian-root"
                      )}
                      onClick={() => setSelectedUpi(app.id)}
                      type="button"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            app.tone
                          )}
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {app.icon}
                          </span>
                        </span>
                        <span>
                          <span className="block font-heading text-label-action font-bold text-on-surface">
                            {app.label}
                          </span>
                          <span className="block text-[11px] text-on-surface-variant">
                            {app.subtitle}
                          </span>
                        </span>
                      </span>
                      {active ? (
                        <span
                          className="material-symbols-outlined text-[20px] text-frost-cyan"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Refund note */}
            <section className="flex items-start gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-inner">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tertiary-container/15">
                <span className="material-symbols-outlined text-[17px] text-tertiary">shield</span>
              </span>
              <div className="min-w-0">
                <p className="font-heading text-[13px] font-bold text-on-surface">
                  100% guaranteed refund protection
                </p>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  Full refund eligible if cancelled before{" "}
                  <strong className="text-on-surface">{refundCutoff}</strong> (2+ hrs prior to the
                  session). Instant return to the original UPI account.
                </p>
              </div>
            </section>
          </div>

          {/* Desktop pay rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border-subtle bg-obsidian-elevated p-4 shadow-cart">
              <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">
                Payable
              </p>
              <p className="mt-1 font-heading text-headline-lg text-frost-cyan tabular-nums">
                ₹{total}
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {station.code} · {tier.label} · {rangeLabel(startHour, hours)}
              </p>
              <button
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-flame-neon to-flame-amber font-heading text-label-action uppercase tracking-wider text-obsidian-root shadow-neon-flame transition-all hover:brightness-110 disabled:opacity-50"
                disabled={!canPay}
                onClick={handlePay}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                Pay ₹{total} via {selectedUpi === "UPI QR" ? "cafe QR" : selectedUpi}
              </button>
              {!phoneValid ? (
                <p className="mt-2 text-center text-[11px] text-outline">
                  Add a 10-digit mobile number to continue
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-obsidian-root/95 px-4 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.85)] backdrop-blur-xl md:px-10 lg:hidden">
        <div className="mx-auto flex w-full max-w-app items-center gap-2 py-3">
          <div className="flex min-w-[90px] flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Payable
            </span>
            <span
              className={cn(
                "font-heading text-headline-md font-bold leading-tight tabular-nums",
                holdExpired ? "text-status-booked" : "text-frost-cyan"
              )}
            >
              ₹{total}
            </span>
          </div>
          <button
            className="flex h-13 min-h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-flame-neon to-flame-amber font-heading text-label-action uppercase tracking-wider text-obsidian-root shadow-neon-flame transition-all active:scale-95 disabled:opacity-50"
            disabled={!canPay}
            onClick={handlePay}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {status === "processing" ? "progress_activity" : "lock"}
            </span>
            {status === "processing"
              ? "Connecting UPI…"
              : `Pay ₹${total} via ${selectedUpi === "UPI QR" ? "cafe QR" : selectedUpi}`}
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}

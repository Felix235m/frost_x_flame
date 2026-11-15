"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerLayout } from "@/components/customer/layout";

const UPI_APPS = [
  { id: "PhonePe", label: "PhonePe", subtitle: "Fastest", icon: "payments", color: "#5f259f", accent: "#a770ef", selected: true },
  { id: "Google Pay", label: "GPay", subtitle: "Instant", icon: "qr_code_scanner", color: "#4285f4", accent: "#38bdf8", selected: false },
  { id: "Paytm", label: "Paytm UPI", subtitle: "Wallet/UPI", icon: "account_balance", color: "#00e5ff", accent: "#00e5ff", selected: false },
  { id: "UPI QR", label: "Any UPI", subtitle: "Scan Cafe QR", icon: "qr_code_2", color: "#ff5500", accent: "#ff5500", selected: false },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedUpi, setSelectedUpi] = useState<string>("PhonePe");
  const [name, setName] = useState("Rahul Sharma");
  const [phone, setPhone] = useState("9876543210");
  const [locality, setLocality] = useState("Navelim");
  const [selectedLocality, setSelectedLocality] = useState("Navelim");
  const [secondsLeft, setSecondsLeft] = useState<number>(10 * 60);
  const [payPressed, setPayPressed] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"idle" | "success" | "failed">("idle");

  const localities = ["Navelim", "Margao", "Benaulim", "Fatorda", "Chinchinim"];

  const totalAmount = 500;

  useEffect(() => {
    if (secondsLeft <= 0 || payPressed) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft, payPressed]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const holdExpired = secondsLeft <= 0;

  const handlePay = () => {
    if (holdExpired) return;
    setPayPressed(true);
    setPaymentResult("success");
  };

  return (
    <CustomerLayout>
      <div className="flex flex-col h-full pb-28">
        {/* Hold countdown bar */}
        <section className="w-full mb-space-sm">
          <div className="relative overflow-hidden rounded-xl bg-obsidian-elevated shadow-lg p-space-md">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-status-held/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-frost-cyan/10 blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between gap-space-xs mb-1.5 relative z-10">
              <div className="flex items-center gap-space-xs">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-held opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-held"></span>
                </span>
                <span className="font-headline-sm text-label-action text-status-held uppercase tracking-wider">
                  Slots Locked For You
                </span>
              </div>
              <div className="flex items-center gap-1 bg-obsidian-root px-2.5 py-1 rounded-full shadow-inner">
                <span className="material-symbols-outlined text-status-held text-[16px] animate-spin" style={{ animationDuration: "4s" }}>hourglass_top</span>
                <span className={`font-label-timer text-label-timer text-status-held font-bold tracking-widest tabular-nums ${holdExpired ? "text-status-booked" : ""}`} id="lock-timer">
                  {timerDisplay}
                </span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant relative z-10">
              To prevent double bookings, <strong className="text-frost-cyan font-semibold">PS 2</strong> is reserved exclusively while you pay.
            </p>
          </div>
        </section>

        {/* Booking summary */}
        <section className="w-full mb-space-md">
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-3.5">
            <div className="flex items-start justify-between pb-3 bg-obsidian-root/60 p-3 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-badge text-label-badge bg-frost-cyan/15 text-frost-cyan px-2 py-0.5 rounded-full uppercase tracking-wider">PlayStation 5</span>
                  <span className="font-label-badge text-label-badge bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">sports_esports</span> 2 Players
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Station: PS 2</h2>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-frost-sky">calendar_today</span>
                  <span>Today, 15 Nov 2026</span>
                  <span className="text-outline-variant">•</span>
                  <span className="material-symbols-outlined text-[16px] text-flame-amber">schedule</span>
                  <span>6:00 PM – 8:00 PM (2h)</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px] text-frost-cyan" style={{ fontVariationSettings: "'FILL' 1" }}>videogame_asset</span>
              </div>
            </div>
            {/* Price breakdown */}
            <div className="space-y-1.5 text-body-sm font-body-sm pt-1">
              <div className="flex justify-between text-on-surface-variant">
                <span>Base Slot Fee (2 Hours)</span>
                <span className="font-medium text-on-surface">₹500</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="flex items-center gap-1">
                  Convenience & UPI Charge
                  <span className="font-label-badge text-label-badge px-1.5 py-0.2 bg-tertiary-container/20 text-tertiary rounded">FREE</span>
                </span>
                <span className="font-medium text-tertiary">₹0</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 bg-obsidian-root/40 px-3 py-2 rounded-lg">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Total Payable</span>
                <div className="text-right">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-frost-cyan font-bold tabular-nums">₹500</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer details form */}
        <section className="w-full mb-space-md">
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Gamer Details</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">No account needed. Quick instant confirmation.</p>
              </div>
              <span className="material-symbols-outlined text-frost-cyan text-[22px]">flash_on</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low text-frost-cyan">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-frost-cyan">badge</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                Returning gamer? Enter your <strong className="text-on-surface font-semibold">10-digit number</strong> to auto-fill!
              </p>
            </div>
            <div className="space-y-3">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block" htmlFor="gamer-name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="gamer-name"
                    className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg px-3.5 pl-11 text-body-md font-body-md outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">person</span>
                </div>
              </div>
              {/* Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block" htmlFor="gamer-phone">
                    Mobile Number
                  </label>
                  <span className="flex items-center gap-1 font-body-sm text-[11px] text-tertiary">
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    WhatsApp E-Ticket
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-body-md text-body-md font-semibold text-on-surface-variant select-none">+91</span>
                  <input
                    id="gamer-phone"
                    className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg pl-14 pr-11 text-body-md font-body-md font-semibold outline-none focus:bg-surface-container-lowest tracking-wider shadow-inner"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    type="tel"
                  />
                  {phone.length === 10 && (
                    <span className="material-symbols-outlined absolute right-3 text-status-available text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              </div>
              {/* Village */}
              <div className="space-y-1.5 pt-1">
                <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block">
                  Locality / Village (Goa)
                </label>
                <div className="relative mb-2">
                  <input
                    id="gamer-locality"
                    className="w-full h-11 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg px-3.5 pl-10 text-body-md font-body-md outline-none shadow-inner"
                    placeholder="Select or enter locality"
                    value={locality}
                    onChange={(e) => {
                      setLocality(e.target.value);
                      setSelectedLocality(e.target.value);
                    }}
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">location_on</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5" id="locality-chips">
                  {localities.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocality(loc);
                        setSelectedLocality(loc);
                      }}
                      className={`locality-chip px-3 py-1.5 rounded-full text-body-sm font-body-sm font-medium active:scale-95 transition-transform ${
                        selectedLocality === loc
                          ? "bg-frost-cyan text-obsidian-root"
                          : "bg-surface-container-high text-on-surface hover:text-frost-cyan"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UPI payment selection */}
        <section className="w-full mb-space-md">
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Select UPI App</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Instant one-tap checkout</p>
              </div>
              <span className="material-symbols-outlined text-tertiary text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-root text-on-surface-variant text-body-sm font-body-sm">
              <span className="material-symbols-outlined text-status-available text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div className="min-w-0 flex-1">
                <p className="font-label-badge text-label-badge text-on-surface truncate">Frost x Flame Gaming Cafe</p>
                <p className="text-[11px] text-outline font-mono truncate">frostxflame@icici • Verified Merchant</p>
              </div>
              <span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded bg-tertiary-container/10 text-tertiary">0% FEE</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5" id="upi-options">
              {UPI_APPS.map((app) => {
                const isSelected = selectedUpi === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedUpi(app.id)}
                    className={`upi-card relative flex items-center justify-between p-3 rounded-xl transition-all active:scale-98 ${
                      isSelected
                        ? "bg-surface-container-high text-left"
                        : "bg-obsidian-root text-left"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${isSelected ? "bg-surface-container" : "bg-surface-container"} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ${isSelected ? app.accent : app.color} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{app.icon}</span>
                      </div>
                      <div>
                        <p className="font-label-action text-label-action text-on-surface font-bold">{app.label}</p>
                        <p className="font-body-sm text-[11px] text-on-surface-variant">{app.subtitle}</p>
                      </div>
                    </div>
                    <span className={`upi-indicator material-symbols-outlined ${isSelected ? "text-frost-cyan" : "hidden"} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Refund policy note */}
        <section className="w-full mb-space-lg">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest flex items-start gap-3 shadow-inner">
            <div className="w-7 h-7 rounded-full bg-tertiary-container/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-tertiary text-[17px]">shield</span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-label-action text-[13px] text-on-surface font-bold">100% Guaranteed Refund Protection</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Full refund eligible if cancelled before <strong className="text-on-surface">4:00 PM today</strong> (2+ hrs prior to session). Instant return to original UPI account.
              </p>
            </div>
          </div>
        </section>

        {/* Sticky pay bar */}
        <aside className="fixed bottom-0 inset-x-0 z-40 bg-obsidian-root/95 backdrop-blur-xl px-margin py-3 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.85)]">
          <div className="max-w-md mx-auto flex items-center gap-space-sm">
            <div className="flex flex-col min-w-[90px]">
              <span className="font-label-badge text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Payable</span>
              <span className={`font-headline-md text-headline-md ${holdExpired ? "text-status-booked" : "text-frost-cyan"} font-bold leading-tight tabular-nums`}>
                ₹{totalAmount}
              </span>
            </div>
            <Button
              variant="flame"
              className="flex-1 h-13 min-h-[50px] rounded-xl shadow-[0_0_24px_rgba(255,85,0,0.4)] active:scale-95 transition-all"
              onClick={handlePay}
              disabled={holdExpired || payPressed || paymentResult === "success"}
            >
              {payPressed || paymentResult === "success" ? (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${paymentResult === "success" ? "" : "animate-spin"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {paymentResult === "success" ? "check_circle" : "progress_activity"}
                  </span>
                  <span id="pay-btn-label">{paymentResult === "success" ? "Slot Reserved!" : "Connecting UPI App..."}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <span id="pay-btn-label">Pay ₹500 via {selectedUpi === "UPI QR" ? "Cafe QR" : selectedUpi}</span>
                </>
              )}
            </Button>
          </div>
        </aside>
      </div>

      {paymentResult === "success" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-obsidian-elevated rounded-2xl p-space-lg shadow-2xl max-w-md w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-status-available/20 flex items-center justify-center text-status-available mx-auto mb-4">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-center mb-2">Payment Successful</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-6">Your slot is confirmed. Redirecting to confirmation...</p>
            <Button variant="flame" className="w-full" onClick={() => router.push("/customer/confirmation/FNF-8924")}>
              Go to Confirmation
            </Button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

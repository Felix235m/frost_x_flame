"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerLayout } from "@/components/customer/layout";

const BOOKING_CODE = "#FNF-8924";

export default function ConfirmationPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BOOKING_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent("Frost x Flame - PS5 Gaming Session");
    const details = encodeURIComponent("Station: Station 2 Duo. Ticket ID: #FNF-8924. Address: Near Navelim Church, Salcete Goa.");
    const location = encodeURIComponent("Frost x Flame Cyber Lounge, Navelim, Goa");
    const dates = "20261115T180000Z/20261115T200000Z";
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent("🎮 We're locked in at Frost x Flame Arena!\n\nTicket: #FNF-8924\nRig: Station 2 (PS5 Pro Duo)\nSlot: Today, 6:00 PM - 8:00 PM\nTotal: ₹500 (Paid)\nLocation: Navelim, Goa\n\nShow QR at counter for zero-wait unlock!");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const minutesLeft = 1;
  const secondsLeft = 48;
  const timerDisplay = `${String(minutesLeft).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}`;

  return (
    <CustomerLayout>
      <div className="flex flex-col h-full pb-24">
        {/* Celebration alert */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-xl mb-space-sm p-space-md">
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-status-available/10 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-available/15 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <span className="material-symbols-outlined text-[15px] text-status-available" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="font-label-badge text-label-badge text-status-available uppercase tracking-wider">Slots Locked & Ready</span>
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-space-xs">
              <div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Ticket Reference</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight" id="bookingCode">{BOOKING_CODE}</h2>
                  <button
                    onClick={handleCopy}
                    className="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-bright active:scale-95 text-frost-cyan flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]" id="copyIcon">{copied ? "done" : "content_copy"}</span>
                    <span className={`font-label-action text-label-action uppercase tracking-wider ${copied ? "text-status-available" : ""}`} id="copyLabel">
                      {copied ? "COPIED" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="material-symbols-outlined text-[16px] text-status-available shrink-0">mark_chat_read</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Dispatched to WhatsApp <span className="text-on-surface font-semibold">+91 98765 43210</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ticket / QR pass */}
        <div className="relative flex flex-col rounded-xl bg-obsidian-card shadow-2xl overflow-hidden mb-space-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-frost-cyan via-tertiary-container to-flame-neon"></div>
          <div className="p-space-md flex flex-col gap-space-md">
            {/* Status */}
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-frost-cyan shadow-[0_0_16px_rgba(0,229,255,0.2)]">
                  <span className="material-symbols-outlined text-[24px]">sports_esports</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-badge text-label-badge uppercase tracking-wider text-frost-cyan">Counter Check-In Pass</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">Frost x Flame Arena</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded bg-status-available/20 text-status-available flex items-center gap-1">
                <span className="font-label-badge text-label-badge tracking-widest uppercase font-bold">PAID</span>
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center justify-center p-space-md rounded-xl bg-obsidian-root relative shadow-inner">
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-frost-cyan pointer-events-none opacity-80"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-frost-cyan pointer-events-none opacity-80"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-frost-cyan pointer-events-none opacity-80"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-frost-cyan pointer-events-none opacity-80"></div>
              <div className="relative p-2 bg-white rounded-lg shadow-[0_0_24px_rgba(0,229,255,0.25)]">
                <svg className="w-36 h-36" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="#0A0C10" height="28" rx="3" width="28" x="5" y="5"></rect>
                  <rect fill="#FFFFFF" height="20" width="20" x="9" y="9"></rect>
                  <rect fill="#0A0C10" height="12" width="12" x="13" y="13"></rect>
                  <rect fill="#0A0C10" height="28" rx="3" width="28" x="67" y="5"></rect>
                  <rect fill="#FFFFFF" height="20" width="20" x="71" y="9"></rect>
                  <rect fill="#0A0C10" height="12" width="12" x="75" y="13"></rect>
                  <rect fill="#0A0C10" height="28" rx="3" width="28" x="5" y="67"></rect>
                  <rect fill="#FFFFFF" height="20" width="20" x="9" y="71"></rect>
                  <rect fill="#0A0C10" height="12" width="12" x="13" y="75"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="38" y="8"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="48" y="8"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="58" y="8"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="38" y="18"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="53" y="18"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="8" y="38"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="8" y="48"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="8" y="58"></rect>
                  <rect fill="#0A0C10" height="16" rx="2" width="16" x="42" y="36"></rect>
                  <rect fill="#00E5FF" height="8" width="8" x="46" y="40"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="20" y="38"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="28" y="46"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="66" y="38"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="76" y="44"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="86" y="38"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="66" y="54"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="38" y="66"></rect>
                  <rect fill="#0A0C10" height="5" width="5" x="48" y="66"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="40" y="76"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="52" y="82"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="68" y="68"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="78" y="74"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="68" y="82"></rect>
                  <rect fill="#0A0C10" height="6" width="6" x="86" y="86"></rect>
                </svg>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-frost-cyan">contactless</span>
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-frost-cyan">Scan At Host Desk For Quick Unlock</span>
              </div>
            </div>

            {/* Station card */}
            <div className="p-space-sm rounded-lg bg-surface-container-high flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Station Allocated</span>
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary px-2 py-0.5 rounded bg-on-secondary-container">Zone Frost-East</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Station 2 • PlayStation 5 Pro</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">65" OLED 120Hz 4K • DualSense Edge Duo Setup</p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Date & Slot</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">Today, 15 Nov</span>
                <span className="font-body-sm text-body-sm text-frost-cyan">6:00 PM – 8:00 PM</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Duration & Squad</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">2 Hours (Duo Pass)</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">2 Players Authorized</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Gamer Name</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">Rahul Sharma</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Navelim, Goa</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Settlement</span>
                <span className="font-body-md text-body-md text-status-available font-bold">₹500.00 Total</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">PhonePe UPI • #T2941</span>
              </div>
            </div>
          </div>
          {/* Perforation */}
          <div className="relative flex items-center justify-between w-full px-2 py-1 bg-obsidian-card">
            <div className="w-6 h-6 rounded-full bg-obsidian-root -ml-6 shadow-inner"></div>
            <div className="flex-1 flex justify-between items-center px-4 overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="h-0.5 w-2 rounded-full bg-surface-variant"></span>
              ))}
            </div>
            <div className="w-6 h-6 rounded-full bg-obsidian-root -mr-6 shadow-inner"></div>
          </div>
          {/* Footer */}
          <div className="p-space-md bg-obsidian-elevated flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-badge text-label-badge tracking-widest text-on-surface-variant uppercase">AUTH TOKEN HASH</span>
              <span className="font-label-timer text-label-timer text-on-surface tracking-wider">7F8A-992D-B3</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-flame-neon">bolt</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider">Fast Lane Ready</span>
            </div>
          </div>
        </div>

        {/* Utilities */}
        <div className="flex flex-col gap-space-sm">
          <div className="grid grid-cols-2 gap-space-sm">
            <Button variant="outline" onClick={handleAddToCalendar}>
              <span className="material-symbols-outlined text-[22px] text-frost-cyan">event_available</span>
              <span className="font-label-action text-label-action uppercase tracking-wide text-left leading-tight">Add to Calendar</span>
            </Button>
            <Button variant="secondary" onClick={handleShareWhatsApp}>
              <span className="material-symbols-outlined text-[22px]">send</span>
              <span className="font-label-action text-label-action uppercase tracking-wide text-left leading-tight">Share on WhatsApp</span>
            </Button>
          </div>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="h-14 w-full rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-98 transition-all flex items-center justify-between px-space-md text-on-surface shadow-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-flame-neon/20 text-flame-neon flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">near_me</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-action text-label-action uppercase tracking-wide">Get Directions to Cafe</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Near Navelim Church Junction, Salcete</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">arrow_forward_ios</span>
          </a>
        </div>

        {/* Cancellation policy */}
        <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm shadow-xl mt-space-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">published_with_changes</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface">Cancellation & Slot Policy</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Eligible for <strong className="text-status-available font-semibold">100% instant refund</strong> if cancelled before <span className="text-on-surface font-semibold">4:00 PM today</span> (at least 2 hours prior to session commencement).
              </p>
            </div>
          </div>
          <div className="p-space-sm rounded-lg bg-obsidian-root flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                <span className="font-body-sm text-body-sm">Self-service lock active</span>
              </div>
              <span className={`font-label-badge text-label-badge uppercase tracking-wider text-flame-amber font-bold`}>
                {timerDisplay} left to cancel
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setModalOpen(true)}
                className="font-label-action text-label-action uppercase tracking-wider text-frost-cyan hover:underline flex items-center gap-1"
              >
                <span>Manage or Cancel Booking</span>
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </button>
              <span className="font-body-sm text-body-sm text-on-surface-variant">PIN: <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface font-mono">8924</code></span>
            </div>
          </div>
        </div>

        {/* Manage/Cancel modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-space-md">
            <div className="w-full max-w-md rounded-2xl bg-surface-container-high p-space-lg flex flex-col gap-space-md shadow-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-status-booked/20 text-status-booked flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Manage Slot {BOOKING_CODE}</h4>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant flex items-center justify-center active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                You are requesting a modification for <strong className="text-on-surface">Station 2 (Today, 6:00 PM - 8:00 PM)</strong>.
                Full refund of <span className="text-status-available font-semibold">₹500</span> will be credited directly to your PhonePe account within 15 minutes.
              </p>
              <div className="flex flex-col gap-1">
                <label className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Security Pass PIN</label>
                <div className="flex gap-2">
                  <input className="w-full h-12 bg-obsidian-root text-on-surface px-3 rounded-lg font-mono text-center tracking-widest text-lg font-bold select-all focus:outline-none focus:ring-0" readOnly type="text" value="8924" />
                </div>
              </div>
              <div className="flex flex-col gap-space-sm pt-2">
                <button onClick={handleCancel} className="w-full h-12 rounded-xl bg-status-booked text-white font-label-action text-label-action uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>Cancel Booking & Process Refund</span>
                </button>
                <button onClick={() => setModalOpen(false)} className="w-full h-12 rounded-xl bg-surface-container-highest text-on-surface font-label-action text-label-action uppercase tracking-wider active:scale-98 transition-all">
                  Keep My Slots
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

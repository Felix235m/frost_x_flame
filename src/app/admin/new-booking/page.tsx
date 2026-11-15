"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEVICES = [
  { id: "ps1", name: "PS 1", type: "ps5", price: 250, available: true },
  { id: "ps2", name: "PS 2", type: "ps5", price: 250, available: true },
  { id: "ps3", name: "PS 3", type: "ps5", price: 250, available: false },
  { id: "vr1", name: "VR 1", type: "vr", price: 300, available: true },
  { id: "vr2", name: "VR 2", type: "vr", price: 300, available: true },
  { id: "sim", name: "Racing Sim", type: "sim", price: 350, available: true },
];

export default function AdminNewBookingPage() {
  const [source, setSource] = useState<"walk-in" | "phone">("walk-in");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [persons, setPersons] = useState(2);
  const [hours, setHours] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const total = selectedDevice
    ? DEVICES.find((d) => d.id === selectedDevice)!.price * hours
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 rounded-full bg-status-available/20 flex items-center justify-center text-status-available mb-6">
          <span className="material-symbols-outlined text-[48px]">check_circle</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Booking Confirmed</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Walk-in session created for {name}. Ticket #FNF-8999.
        </p>
        <Button variant="flame" onClick={() => setSubmitted(false)}>Create Another</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">New Booking</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Walk-in or phone booking at the counter</p>
        </div>
      </div>
      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-lg max-w-lg">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSource("walk-in")}
            className={`flex-1 py-2 rounded-lg font-body-md text-body-sm transition-colors ${
              source === "walk-in"
                ? "bg-frost-cyan text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
            }`}
          >
            Walk-in
          </button>
          <button
            onClick={() => setSource("phone")}
            className={`flex-1 py-2 rounded-lg font-body-md text-body-sm transition-colors ${
              source === "phone"
                ? "bg-frost-cyan text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
            }`}
          >
            Phone
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <span className="absolute left-3 font-body-md text-body-md font-semibold text-on-surface-variant select-none">+91</span>
            <input
              className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg pl-14 pr-11 text-body-md font-body-md font-semibold outline-none focus:bg-surface-container-lowest tracking-wider shadow-inner"
              maxLength={10}
              placeholder="98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              type="tel"
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block">Customer Name</label>
            <input
              className="w-full h-12 bg-obsidian-root text-on-surface placeholder:text-outline rounded-lg px-3.5 text-body-md font-body-md outline-none focus:bg-surface-container-lowest shadow-inner"
              placeholder="Walk-in customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDevice(selectedDevice === d.id ? null : d.id)}
                disabled={!d.available}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all active:scale-95 ${
                  selectedDevice === d.id
                    ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.45)]"
                    : d.available
                    ? "bg-surface-container hover:bg-surface-container-high border border-outline-variant/30"
                    : "bg-surface-container-lowest opacity-50 cursor-not-allowed border border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] mb-1">
                  {d.type === "ps5" ? "videogame_asset" : d.type === "vr" ? "view_in_ar" : "sports_score"}
                </span>
                <span className={`font-headline-sm text-headline-sm ${d.available ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                  {d.name}
                </span>
                <span className={`font-body-sm text-body-sm ${d.available ? "text-frost-cyan" : "text-on-surface-variant"} tabular-nums`}>
                  ₹{d.price}/h
                </span>
              </button>
            ))}
          </div>
          {selectedDevice && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/20">
              <div className="space-y-2">
                <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block">Persons</label>
                <select
                  className="w-full h-11 bg-obsidian-root text-on-surface rounded-lg outline-none focus:bg-surface-container-lowest shadow-inner pl-3"
                  value={persons}
                  onChange={(e) => setPersons(parseInt(e.target.value))}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider block">Hours</label>
                <select
                  className="w-full h-11 bg-obsidian-root text-on-surface rounded-lg outline-none focus:bg-surface-container-lowest shadow-inner pl-3"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                >
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="3">3 Hours</option>
                </select>
              </div>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center justify-between">
            <div className="flex flex-col items-end">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Total</span>
              <span className={`font-headline-lg-mobile text-headline-lg-mobile text-frost-cyan font-bold tabular-nums mt-0.5`}>
                ₹{total}
              </span>
            </div>
            <Button variant="flame" type="submit" className="w-full md:w-auto" disabled={!selectedDevice || !mobile || !name}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

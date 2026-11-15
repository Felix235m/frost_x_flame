"use client";

import { useState, useCallback, useEffect } from "react";
import { getAvailability } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DeviceStatus = "available" | "selected" | "booked" | "waitlist";

interface FloorDevice {
  id: string;
  name: string;
  type: "ps5" | "vr" | "sim";
  pricePerHour: number;
  status: DeviceStatus;
  bookedLabel?: string;
}

const FLOOR_DEVICES: FloorDevice[] = [
  { id: "ps1", name: "PS 1", type: "ps5", pricePerHour: 250, status: "available" },
  { id: "ps2", name: "PS 2", type: "ps5", pricePerHour: 250, status: "available" },
  { id: "ps3", name: "PS 3", type: "ps5", pricePerHour: 250, status: "available" },
  { id: "vr1", name: "VR 1", type: "vr", pricePerHour: 300, status: "available" },
  { id: "vr2", name: "VR 2", type: "vr", pricePerHour: 300, status: "available" },
  { id: "sim", name: "Racing Sim", type: "sim", pricePerHour: 350, status: "available" },
];

const TYPE_COLORS: Record<string, string> = {
  ps5: "frost-cyan",
  vr: "frost-cyan",
  sim: "flame-neon",
};

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [selectedTime, setSelectedTime] = useState<string>("18:00");
  const [selectedHours, setSelectedHours] = useState<number>(2);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Map<string, "free" | "booked">>(new Map());
  const [loading, setLoading] = useState(false);

  const cartTotal = selectedDeviceId
    ? availability.get(selectedDeviceId) === "free"
      ? FLOOR_DEVICES.find((d) => d.id === selectedDeviceId)!.pricePerHour * selectedHours
      : 0
    : 0;

  const handleSelectDevice = (id: string) => {
    if (availability.get(id) !== "free") return;
    setSelectedDeviceId(id === selectedDeviceId ? null : id);
  };

  const [dateOptions, setDateOptions] = useState<{ label: string; value: string; date: string }[]>([]);

useEffect(() => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  setDateOptions([
    { label: "Today", value: "today", date: today },
    { label: "Tomorrow", value: "tomorrow", date: tomorrow },
  ]);
}, []);

  const timeOptions = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"];

  useEffect(() => {
    let mounted = true;
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const date = dateOptions.find((d) => d.value === selectedDate)?.date || selectedDate;
        const data = await getAvailability(date, selectedTime, selectedHours);
        if (mounted) {
          const map = new Map<string, "free" | "booked">();
          data.forEach((d) => map.set(d.device_id, d.status));
          setAvailability(map);
        }
      } catch {
        // Fallback: mark all as free
        if (mounted) {
          const map = new Map<string, "free" | "booked">();
          FLOOR_DEVICES.forEach((d) => map.set(d.id, "free"));
          setAvailability(map);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAvailability();
    return () => { mounted = false; };
  }, [selectedDate, selectedTime, selectedHours]);

  return (
    <div className="flex flex-col h-full">
      {/* Top ambient telemetry strip */}
      <div className="flex items-center justify-between py-space-sm px-space-xs mb-space-sm bg-obsidian-elevated rounded-xl shadow-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-ping"></span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Floor Grid Live</span>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full">
          <span className="material-symbols-outlined text-[16px] text-frost-cyan" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="font-label-badge text-label-badge text-frost-cyan uppercase tracking-wider">Fast Hold • 10m Lock</span>
        </div>
      </div>

      {/* Booking temporal controls */}
      <section className="flex flex-col gap-space-sm mb-space-md">
        {/* Date pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedDate(opt.value)}
              className={`group flex flex-col items-center justify-center min-w-[76px] h-[60px] px-space-sm rounded-xl transition-transform active:scale-95 shrink-0 ${
                selectedDate === opt.value
                  ? "bg-frost-cyan text-obsidian-root shadow-lg"
                  : "bg-obsidian-elevated text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="font-label-badge text-label-badge uppercase tracking-widest opacity-80">{opt.label}</span>
              <span className={`font-headline-sm text-headline-sm font-bold ${selectedDate === opt.value ? "text-obsidian-root" : "text-on-surface"}`}>
                {new Date(opt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </button>
          ))}
        </div>

        {/* Start time selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">Session Kickoff</span>
            <span className="font-body-sm text-body-sm text-frost-cyan">Zone Peak: 6 PM - 11 PM</span>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
            {timeOptions.map((t) => {
              const [h, m] = t.split(":").map(Number);
              const displayTime = new Date(0, 0, 0, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`h-10 px-3.5 rounded-lg font-label-action text-label-action flex items-center justify-center whitespace-nowrap active:scale-95 transition-all shrink-0 ${
                    selectedTime === t
                      ? "bg-frost-cyan text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.45)]"
                      : "bg-obsidian-elevated text-on-surface-variant"
                  }`}
                >
                  {displayTime}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration selector */}
        <div className="grid grid-cols-3 gap-space-xs p-1 bg-obsidian-elevated rounded-xl shadow-inner">
          {[1, 2, 3].map((hrs) => (
            <button
              key={hrs}
              onClick={() => setSelectedHours(hrs)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 ${
                selectedHours === hrs
                  ? "bg-surface-container text-frost-cyan shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className={`font-headline-sm text-headline-sm ${selectedHours === hrs ? "font-bold text-on-surface" : ""}`}>
                {hrs} Hr{hrs > 1 ? "s" : ""}
              </span>
              <span className={`font-body-sm text-body-sm ${selectedHours === hrs ? "font-semibold text-frost-cyan" : "opacity-70"}`}>
                ₹{hrs * 250}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive floor layout map */}
      <section className="flex flex-col gap-space-sm mb-space-lg flex-1 min-h-0">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-frost-cyan text-[20px]">map</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Interactive Arena Map</span>
          </div>
        </div>

        <div className="relative w-full rounded-2xl bg-obsidian-elevated p-space-sm overflow-hidden shadow-2xl flex-1 min-h-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-space-md overflow-y-auto h-full pr-2">
            {/* Top row: 3 PS5 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-frost-cyan">tv</span>
                  PlayStation 5 Pro OLED Row
                </span>
                <span className="font-label-badge text-label-badge text-frost-sky">Stage North</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FLOOR_DEVICES.filter((d) => d.type === "ps5").map((d) => (
                  <DeviceCard key={d.id} device={d} isSelected={selectedDeviceId === d.id} onSelect={handleSelectDevice} isAvailable={availability.get(d.id) === "free"} />
                ))}
              </div>
            </div>

            {/* Middle & lower split */}
            <div className="grid grid-cols-5 gap-space-sm">
              {/* Left: Lounge */}
              <div className="col-span-2 flex flex-col justify-between p-3 rounded-xl bg-surface-container-low/70 backdrop-blur-md relative overflow-hidden">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                    <span className="font-label-badge text-label-badge uppercase tracking-wider">Lounge Area</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">Chill Bar & Gear Hub</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Free Red Bull with 2+ hrs console reservation.</p>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 pt-2">
                  <div className="flex items-center gap-1 bg-obsidian-elevated/80 px-2 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">wifi</span>
                    <span className="font-body-sm text-body-sm text-on-surface">500 Mbps Fiber</span>
                  </div>
                  <div className="flex items-center gap-1 bg-obsidian-elevated/80 px-2 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px] text-flame-neon-orange">bolt</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Fast Chargers</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-on-surface-variant font-label-badge text-label-badge uppercase tracking-wider bg-obsidian-root/60 px-2 py-1 rounded-md">
                  <span>Main Entry</span>
                  <span className="material-symbols-outlined text-[14px] text-frost-cyan">sensor_door</span>
                </div>
              </div>

              {/* Right: VR + Sim */}
              <div className="col-span-3 flex flex-col gap-space-sm">
                {/* VR Zone */}
                <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-badge text-label-badge uppercase tracking-wider text-frost-cyan flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                      VR Zone Arena
                    </span>
                    <span className="font-label-badge text-label-badge text-on-surface-variant">Omni Mats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FLOOR_DEVICES.filter((d) => d.type === "vr").map((d) => (
                      <DeviceCard key={d.id} device={d} isSelected={selectedDeviceId === d.id} onSelect={handleSelectDevice} isAvailable={availability.get(d.id) === "free"} compact />
                    ))}
                  </div>
                </div>

                {/* Racing Sim */}
                <DeviceCard
                  key="sim"
                  device={FLOOR_DEVICES.find((d) => d.id === "sim")!}
                  isSelected={selectedDeviceId === "sim"}
                  onSelect={handleSelectDevice}
                  isAvailable={availability.get("sim") === "free"}
                  wide
                />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-obsidian-root/80 flex items-center justify-center z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-space-sm">
              <div className="w-8 h-8 border-4 border-frost-cyan border-t-transparent rounded-full animate-[spin_1s_linear_infinite]"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Loading availability...</span>
            </div>
          </div>
        )}
      </section>

      {/* Sticky cart bar */}
      {selectedDeviceId && availability.get(selectedDeviceId) === "free" && (
        <aside className="fixed bottom-20 inset-x-0 z-40 px-margin pb-2">
          <div className="max-w-lg mx-auto bg-obsidian-elevated/95 backdrop-blur-2xl rounded-2xl p-space-sm shadow-cart">
            <div className="flex items-center justify-between pb-space-xs mb-space-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-frost-cyan/10 text-frost-cyan flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">sports_esports</span>
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                      {FLOOR_DEVICES.find((d) => d.id === selectedDeviceId)?.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container text-frost-sky font-label-badge text-label-badge uppercase">
                      2 Players
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {selectedDate} • {selectedTime} ({selectedHours} Hour{selectedHours > 1 ? "s" : ""})
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="font-label-badge text-label-badge text-status-held uppercase tracking-wider flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] animate-pulse">hourglass_top</span>
                  Hold: 10:00
                </span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-frost-cyan font-bold leading-none mt-0.5 tabular-nums">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button variant="secondary" size="sm" onClick={() => setSelectedDeviceId(null)}>
                <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                <span className="hidden xs:inline">Remove Unit</span>
              </Button>
              <Button variant="flame" className="flex-1" asChild>
                <a href="/customer/checkout">Continue to Checkout</a>
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

interface DeviceCardProps {
  device: FloorDevice;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isAvailable: boolean;
  compact?: boolean;
  wide?: boolean;
}

function DeviceCard({ device, isSelected, onSelect, isAvailable, compact, wide }: DeviceCardProps) {
  const typeColor = TYPE_COLORS[device.type];
  const handleClick = () => {
    if (!isAvailable) return;
    onSelect(device.id);
  };

  if (compact) {
    return (
      <div
        className={`flex flex-col justify-between p-2 rounded-lg cursor-pointer transition-all active:scale-95 ${
          isSelected
            ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_12px_rgba(0,229,255,0.45)]"
            : isAvailable
            ? "bg-obsidian-elevated hover:bg-surface-container-high shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            : "bg-surface-container-lowest opacity-50 cursor-not-allowed"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{device.name}</span>
          <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-status-available" : "bg-status-booked"}`}></span>
        </div>
        <span className={`font-body-sm text-body-sm mt-1 ${isAvailable ? "text-status-available" : "text-status-booked"}`}>
          {isAvailable ? "Free" : "In Session"}
        </span>
        <div className="mt-1 flex items-center justify-between pt-1 opacity-70">
          <span className="font-body-sm text-body-sm text-on-surface-variant">₹{device.pricePerHour}/h</span>
        </div>
      </div>
    );
  }

  if (wide) {
    return (
      <div
        className={`flex flex-col p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_20px_rgba(255,85,0,0.25)] group ${
          isSelected
            ? "bg-surface-container-high ring-2 ring-frost-cyan"
            : isAvailable
            ? "bg-surface-container shadow-[0_0_20px_rgba(255,85,0,0.25)]"
            : "bg-surface-container-lowest opacity-45 cursor-not-allowed"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-surface-obsidian-root flex items-center justify-center text-status-available shadow-md">
              <span className="material-symbols-outlined text-[16px]">sports_score</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">{device.name}</span>
              <span className="font-body-sm text-body-sm text-flame-amber font-medium">Ultra Force Motion Rig</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full ${isAvailable ? "bg-flame-amber/20 text-flame-amber" : "bg-status-booked/20 text-status-booked"} font-label-badge text-label-badge uppercase font-bold`}>
            {isAvailable ? "Avail" : "Booked"}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between bg-obsidian-root px-2 py-1.5 rounded-lg">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Fanatec Direct Drive</span>
          <span className={`font-label-action text-label-action ${typeColor}-neon font-bold`}>₹{device.pricePerHour}<span className="text-[10px] text-on-surface-variant font-normal">/h</span></span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 shadow-inner group hover:bg-surface-container-high ${
        isSelected
          ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.45)]"
          : isAvailable
          ? "bg-surface-container shadow-[0_0_18px_rgba(16,185,129,0.22)]"
          : "bg-surface-container-lowest opacity-60 cursor-not-allowed"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="w-6 h-6 rounded-md bg-obsidian-root flex items-center justify-center text-status-available shadow-sm">
          <span className="material-symbols-outlined text-[16px]">videogame_asset</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded-full ${isAvailable ? "bg-status-available/20 text-status-available" : "bg-status-booked/20 text-status-booked"} font-label-badge text-label-badge tracking-wider uppercase`}>
          {isAvailable ? "Avail" : device.bookedLabel || "Booked"}
        </span>
      </div>
      <div className="mt-2">
        <p className={`font-headline-sm text-headline-sm ${isAvailable ? "text-on-surface font-semibold" : "text-on-surface-variant font-medium line-through"}`}>{device.name}</p>
        <p className={`font-body-sm text-body-sm ${isAvailable ? "text-on-surface-variant" : "text-on-surface-variant"} truncate`}>OLED 65"</p>
      </div>
      <div className="mt-2 pt-1 flex items-center justify-between bg-obsidian-root/50 px-1.5 py-1 rounded-lg">
        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">2P</span>
        <span className={`font-label-action text-label-action ${isAvailable ? "text-status-available" : "text-on-surface-variant"}`}>₹{device.pricePerHour}<span className="font-body-sm text-[10px] text-on-surface-variant">/h</span></span>
      </div>
      {!isAvailable && (
        <button className="mt-2 pt-1 flex items-center justify-center gap-1 bg-surface-container py-1 rounded-lg text-on-surface hover:text-frost-cyan transition-colors" onClick={(e) => { e.stopPropagation(); }} type="button">
          <span className="material-symbols-outlined text-[12px]">notifications</span>
          <span className="font-label-badge text-label-badge uppercase tracking-wider text-[9px]">Notify</span>
        </button>
      )}
    </div>
  );
}

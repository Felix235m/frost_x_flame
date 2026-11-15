"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AdminDeviceState = "free" | "running" | "overtime" | "upcoming" | "blocked";

interface AdminDevice {
  id: string;
  name: string;
  type: "ps5" | "vr" | "sim";
  state: AdminDeviceState;
  countdown?: string;
  session?: string;
}

const ADMIN_DEVICES: AdminDevice[] = [
  { id: "ps1", name: "Station 1", type: "ps5", state: "free" },
  { id: "ps2", name: "Station 2", type: "ps5", state: "running", countdown: "42:18", session: "Rahul • 2P" },
  { id: "ps3", name: "Station 3", type: "ps5", state: "free" },
  { id: "vr1", name: "VR 1", type: "vr", state: "free" },
  { id: "vr2", name: "VR 2", type: "vr", state: "running", countdown: "18:05", session: "Priya • 2P" },
  { id: "sim", name: "Racing Sim", type: "sim", state: "upcoming", countdown: "in 12 min" },
];

const STATE_CONFIG: Record<AdminDeviceState, { label: string; color: string; glow: string }> = {
  free: { label: "FREE", color: "status-available", glow: "shadow-[0_0_18px_rgba(16,185,129,0.22)]" },
  running: { label: "LIVE", color: "status-available", glow: "shadow-[0_0_24px_rgba(0,229,255,0.45)]" },
  overtime: { label: "OVERTIME", color: "status-held", glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]" },
  upcoming: { label: "UPCOMING", color: "status-held", glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  blocked: { label: "BLOCKED", color: "status-booked", glow: "" },
};

export default function AdminFloorPage() {
  const [walkInDevice, setWalkInDevice] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Live Floor</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time station status and session telemetry</p>
        </div>
        <Button variant="flame" onClick={() => {}}>
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Quick Check-In
        </Button>
      </div>

      <div className="relative w-full rounded-2xl bg-obsidian-elevated p-space-sm overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-space-md">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-frost-cyan">tv</span>
                PlayStation 5 Pro Row
              </span>
              <span className="font-label-badge text-label-badge text-frost-sky">Stage North</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ADMIN_DEVICES.filter((d) => d.type === "ps5").map((d) => (
                <AdminDeviceCard key={d.id} device={d} onWalkIn={() => setWalkInDevice(d.id)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-space-sm">
            <div className="col-span-2 flex flex-col justify-between p-3 rounded-xl bg-surface-container-low/70 backdrop-blur-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                  <span className="font-label-badge text-label-badge uppercase tracking-wider">Lounge Area</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">Chill Bar & Gear Hub</h3>
              </div>
            </div>
            <div className="col-span-3 flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-badge text-label-badge uppercase tracking-wider text-frost-cyan flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                    VR Zone Arena
                  </span>
                  <span className="font-label-badge text-label-badge text-on-surface-variant">Omni Mats</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ADMIN_DEVICES.filter((d) => d.type === "vr").map((d) => (
                    <AdminDeviceCard key={d.id} device={d} onWalkIn={() => setWalkInDevice(d.id)} compact />
                  ))}
                </div>
              </div>
              <AdminDeviceCard
                key="sim"
                device={ADMIN_DEVICES.find((d) => d.id === "sim")!}
                onWalkIn={() => setWalkInDevice("sim")}
                wide
              />
            </div>
          </div>
        </div>
      </div>

      {walkInDevice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-obsidian-elevated rounded-2xl p-space-lg shadow-2xl max-w-md w-full mx-4">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">Start Walk-In Session</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface">Device</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold">{ADMIN_DEVICES.find((d) => d.id === walkInDevice)?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface">Source</span>
                <span className="font-label-badge text-label-badge text-frost-cyan uppercase tracking-wider">Walk-in</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface">Duration</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold">1 Hour</span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setWalkInDevice(null)}>
                Cancel
              </Button>
              <Button variant="flame" className="flex-1" onClick={() => setWalkInDevice(null)}>
                Confirm Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AdminDeviceCardProps {
  device: AdminDevice;
  onWalkIn: (id: string) => void;
  compact?: boolean;
  wide?: boolean;
}

function AdminDeviceCard({ device, onWalkIn, compact, wide }: AdminDeviceCardProps) {
  const config = STATE_CONFIG[device.state];
  const typeColor = device.type === "sim" ? "flame-neon" : "frost-cyan";

  if (compact) {
    return (
      <div
        className={`flex flex-col justify-between p-2 rounded-lg transition-all active:scale-95 ${
          device.state === "free"
            ? "bg-obsidian-elevated hover:bg-surface-container-high shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            : device.state === "running"
            ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_12px_rgba(0,229,255,0.45)]"
            : "bg-surface-container-lowest opacity-50"
        }`}
        onClick={() => device.state === "free" ? onWalkIn(device.id) : undefined}
      >
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{device.name}</span>
          <Badge variant={device.state === "free" ? "available" : "held"}>{config.label}</Badge>
        </div>
        {device.countdown && (
          <div className="mt-1 flex items-center justify-between">
            <span className={`font-body-sm text-body-sm ${device.state === "running" ? "text-frost-cyan font-bold tabular-nums" : "text-on-surface-variant"}`}>
              {device.countdown}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (wide) {
    return (
      <div
        className={`flex flex-col p-2.5 rounded-xl transition-all active:scale-95 group ${
          device.state === "free"
            ? "bg-surface-container shadow-[0_0_20px_rgba(255,85,0,0.25)]"
            : device.state === "running"
            ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.45)]"
            : device.state === "upcoming"
            ? "bg-surface-container-high shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            : "bg-surface-container-lowest opacity-45"
        }`}
        onClick={() => device.state === "free" ? onWalkIn(device.id) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-obsidian-root flex items-center justify-center text-status-available shadow-md">
              <span className="material-symbols-outlined text-[16px]">sports_score</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">{device.name}</span>
              <span className="font-body-sm text-body-sm text-flame-amber font-medium">Ultra Force Motion Rig</span>
            </div>
          </div>
          <Badge variant={device.state === "free" ? "available" : "held"}>{config.label}</Badge>
        </div>
        {device.countdown && (
          <div className="mt-2.5 flex items-center justify-between bg-obsidian-root px-2 py-1.5 rounded-lg">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Session Active</span>
            <span className={`font-label-action text-label-action ${typeColor}-neon font-bold tabular-nums`}>
              {device.countdown}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-2.5 rounded-xl transition-all duration-300 active:scale-95 shadow-inner group hover:bg-surface-container-high ${
        device.state === "free"
          ? "bg-surface-container shadow-[0_0_18px_rgba(16,185,129,0.22)]"
          : device.state === "running"
          ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.45)]"
          : device.state === "overtime"
          ? "bg-surface-container-high ring-2 ring-status-held shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          : device.state === "upcoming"
          ? "bg-surface-container-high shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          : "bg-surface-container-lowest opacity-60 cursor-not-allowed"
      }`}
      onClick={() => device.state === "free" ? onWalkIn(device.id) : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="w-6 h-6 rounded-md bg-obsidian-root flex items-center justify-center text-status-available shadow-sm">
          <span className="material-symbols-outlined text-[16px]">videogame_asset</span>
        </div>
        <Badge variant={device.state === "free" ? "available" : "held" as any}>{config.label}</Badge>
      </div>
      <div className="mt-2">
        <p className={`font-headline-sm text-headline-sm ${device.state === "free" ? "text-on-surface font-semibold" : "text-on-surface-variant font-medium"}`}>{device.name}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">OLED 65"</p>
      </div>
      <div className="mt-2 pt-1 flex items-center justify-between bg-obsidian-root/50 px-1.5 py-1 rounded-lg">
        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">2P</span>
        {device.countdown ? (
          <span className={`font-label-action text-label-action ${typeColor === "frost-cyan" ? "text-frost-cyan" : "text-flame-neon"} font-bold tabular-nums`}>
            {device.countdown}
          </span>
        ) : (
          <span className={`font-label-action text-label-action ${typeColor}-neon font-bold`}>₹{device.type === "sim" ? 350 : 250}<span className="font-body-sm text-[10px] text-on-surface-variant">/h</span></span>
        )}
      </div>
      {device.state === "free" && (
        <button className="mt-2 pt-1 flex items-center justify-center gap-1 bg-frost-cyan text-obsidian-root font-heading text-label-badge text-label-badge uppercase tracking-wider py-1 rounded-lg active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); onWalkIn(device.id); }}>
          <span className="material-symbols-outlined text-[12px] font-bold">play_arrow</span>
          <span>Start Walk-In</span>
        </button>
      )}
    </div>
  );
}

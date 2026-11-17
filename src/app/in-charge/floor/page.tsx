"use client";

import { useEffect, useState } from "react";
import { getDevices, getFloorStatus, getSession, type InChargeSession } from "@/lib/actions/in-charge";
import { StationCard } from "@/components/in-charge/StationCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const KOLKATA_OFFSET = 5 * 60 + 30;

function localNowISO() {
  const now = new Date();
  const local = new Date(now.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toISOString();
}

export default function FloorPage() {
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [devices, setDevices] = useState<{ id: string; name: string; type: string; zone: string | null; display_order: number; max_persons: number; image_url: string | null; description: string | null; is_active: boolean }[]>([]);
  const [availability, setAvailability] = useState<{ device_id: string; name: string; type: string; status: "free" | "booked"; price_per_hour: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const today = localNowISO().slice(0, 10);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, d, a] = await Promise.all([getSession(), getDevices(), getFloorStatus(today, "00:00", 24)]);
        if (!mounted) return;
        setSession(s);
        setDevices(d.map((x) => ({ id: x.id, name: x.name, type: x.type, zone: x.zone, display_order: x.display_order, max_persons: x.max_persons, image_url: x.image_url, description: x.description, is_active: x.is_active })));
        setAvailability(a);
      } catch {
        // handled by login redirect in layout if no session
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [today]);

  const byDevice = new Map(availability.map((a) => [a.device_id, a]));
  const activeCount = availability.filter((a) => a.status === "booked").length;
  const freeCount = availability.filter((a) => a.status === "free").length;
  const gross = availability.reduce((sum, a) => sum + (a.price_per_hour || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-obsidian-root">
        <span className="material-symbols-outlined animate-spin text-frost-cyan text-[32px]">loading</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Live Floor Status</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time station status and session telemetry • {today}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5">
          <span className="h-2 w-2 animate-ping rounded-full bg-status-available" />
          <span className="text-body-sm text-on-surface-variant">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-body-sm">
        <TelemetryCard label="Active" value={activeCount} variant="frost" icon="live_help" />
        <TelemetryCard label="Open" value={freeCount} variant="available" icon="check_circle" />
        <TelemetryCard label="Upcoming" value="—" variant="flame" icon="schedule" />
        <TelemetryCard label="Shift Gross" value={`₹${gross}`} variant="frost" icon="payments" />
      </div>

      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
        <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">Stations</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="text-on-surface" onClick={() => {}}>
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {devices.map((device) => {
          const avail = byDevice.get(device.id);
          const status = avail?.status ?? "free";
          return (
            <StationCard
              key={device.id}
              name={device.name}
              type={device.type}
              status={status as "free" | "booked" | "running" | "upcoming"}
              customer={null}
              session={avail ? "--:--" : null}
              amount={avail?.price_per_hour ?? null}
              onPress={() => {}}
            />
          );
        })}
      </div>

      <div className="mt-auto border-t border-outline-variant/20 pt-4 flex items-center justify-between">
        <span className="text-body-sm text-on-surface-variant">Frost x Flame Gaming Cafe</span>
        <Link href="/in-charge/walk-in">
          <Button variant="flame" size="sm">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Book Walk-in
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TelemetryCard({
  label,
  value,
  variant,
  icon,
}: {
  label: string;
  value: string | number;
  variant: "frost" | "available" | "flame";
  icon: string;
}) {
  const bg = variant === "frost" ? "bg-frost-cyan/10" : variant === "available" ? "bg-status-available/10" : "bg-flame-neon/10";
  const text = variant === "frost" ? "text-frost-cyan" : variant === "available" ? "text-status-available" : "text-flame-neon";
  return (
    <div className={cn("rounded-xl border p-3 flex items-center gap-3", bg)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40">
        <span className={`material-symbols-outlined text-[18px] ${text}`}>{icon}</span>
      </div>
      <div>
        <p className="text-label-badge uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className={`font-heading text-headline-sm font-bold ${text}`}>{value}</p>
      </div>
    </div>
  );
}

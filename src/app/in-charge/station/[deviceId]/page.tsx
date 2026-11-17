"use client";

import { useEffect, useState } from "react";
import { getDevices, getDeviceDayTimeline, getStationBookings, getSession, type InChargeSession } from "@/lib/actions/in-charge";
import { StationCard } from "@/components/in-charge/StationCard";
import { CountdownTimer } from "@/components/in-charge/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const KOLKATA_OFFSET = 5 * 60 + 30;

function localTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export default function StationPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [devices, setDevices] = useState<{ id: string; name: string; type: string; zone: string | null; display_order: number; max_persons: number; image_url: string | null; description: string | null; is_active: boolean }[]>([]);
  const [timeline, setTimeline] = useState<{ hour: number; status: "free" | "booked" | "held"; booking_id: string | null }[]>([]);
  const [bookings, setBookings] = useState<{ id: string; booking_code: string; customer_id: string; source: string; status: string; start_at: string; end_at: string; hours: number; total_amount: number; customer_name: string | null; customer_mobile: string; customer_village: string | null; device_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const today = localTodayISO();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!deviceId) return;
      try {
        const [s, d, t, b] = await Promise.all([
          getSession(),
          getDevices(),
          getDeviceDayTimeline(deviceId, today),
          getStationBookings(deviceId, today),
        ]);
        if (!mounted) return;
        setSession(s);
        setDevices(d.map((x) => ({ id: x.id, name: x.name, type: x.type, zone: x.zone, display_order: x.display_order, max_persons: x.max_persons, image_url: x.image_url, description: x.description, is_active: x.is_active })));
        setTimeline(t);
        setBookings(b);
      } catch {
        // handled by layout login redirect if no session
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [deviceId, today]);

  const device = devices.find((d) => d.id === deviceId);
  const now = new Date();
  const localNow = new Date(now.getTime() + KOLKATA_OFFSET * 60 * 1000);
  const currentHour = localNow.getHours();

  const active = timeline.find(
    (t) => t.status === "booked" && t.booking_id && currentHour >= t.hour && currentHour < t.hour + 1,
  );
  const upcoming = bookings.slice(0, 3);

  const completedCount = timeline.filter((t) => t.status === "booked" && t.hour < currentHour).length;
  const freeCount = timeline.filter((t) => t.status === "free").length;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-obsidian-root">
        <span className="material-symbols-outlined animate-spin text-frost-cyan text-[32px]">loading</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <Link href="/in-charge/floor">
          <Button variant="ghost" size="sm" type="button">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Floor
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            {device?.name ?? "Station"}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {device?.type?.toUpperCase() ?? ""} • {today}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-body-sm">
        <TelemetryCard label="Completed Today" value={completedCount} icon="check_circle" />
        <TelemetryCard label="Free Slots" value={freeCount} icon="check_circle" variant="available" />
        <TelemetryCard label="Upcoming" value={upcoming.length} icon="schedule" variant="flame" />
        <TelemetryCard label="Today's Gross" value="₹0" icon="payments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-headline-sm font-bold text-on-surface">Today's Timeline</h3>
              <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">{today}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              {timeline.map((t) => {
                const isCurrent = t.hour === currentHour;
                return (
                  <div
                    key={t.hour}
                    className={cn(
                      "rounded-lg border p-2 text-center text-[10px] font-heading uppercase tracking-wider transition-colors",
                      t.status === "free"
                        ? "bg-surface-container border-border-subtle text-on-surface-variant"
                        : t.status === "held"
                          ? "bg-surface-container-low border-status-held/30 text-status-held"
                          : isCurrent
                            ? "bg-frost-cyan/20 border-frost-cyan/50 text-frost-cyan font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                            : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant"
                    )}
                  >
                    {t.hour}:00
                    {t.status === "booked" && t.booking_id ? (
                      <span className="block text-[9px] mt-0.5 text-status-booked">Booked</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <section className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
            <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="default" className="w-full" type="button">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Extend +1hr
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <span className="material-symbols-outlined text-[16px]">login</span>
                Mark Arrived
              </Button>
              <Button variant="danger" className="w-full" type="button">
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Check Out Early
              </Button>
            </div>
          </section>

          {upcoming.length > 0 && (
            <section className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
              <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-3">Upcoming</h3>
              {upcoming.map((b) => (
                <div key={b.id} className="rounded-lg border border-outline-variant/20 bg-surface-container p-2.5 mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body-sm text-body-sm text-on-surface">{b.booking_code}</span>
                    <Badge variant={b.status === "confirmed" ? "frost" : "held"}>{b.status}</Badge>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {b.customer_name ?? "Guest"} • {b.customer_mobile}
                  </p>
                  <Button variant="outline" size="sm" className="w-full" type="button">
                    Cancel Booking
                  </Button>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string | number;
  icon: string;
  variant?: "available" | "flame";
}) {
  const bg = variant === "available" ? "bg-status-available/10" : variant === "flame" ? "bg-flame-neon/10" : "bg-frost-cyan/10";
  const text =
    variant === "available" ? "text-status-available" : variant === "flame" ? "text-flame-neon" : "text-frost-cyan";
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

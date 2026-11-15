"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAvailability } from "@/lib/actions/bookings";
import { CustomerLayout } from "@/components/customer/layout";
import { StationTile, type StationStatus } from "@/components/customer/station-tile";
import { cn } from "@/lib/utils";
import {
  PS5_ROW,
  SIM_RIG,
  TIME_SLOTS,
  VR_PODS,
  getStation,
  hourLabel,
  slotValue,
  type DayOption,
  type Station,
} from "@/lib/content/booking";
import { GAMES } from "@/lib/content/games";

export interface ArenaFloorPlanProps {
  days: DayOption[];
}

export function ArenaFloorPlan({ days }: ArenaFloorPlanProps) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.value ?? "");
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Map<string, "free" | "booked">>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAvailability(selectedDate, slotValue(selectedHour), 1)
      .then((rows) => {
        if (!active) return;
        const next = new Map<string, "free" | "booked">();
        rows.forEach((row) => next.set(row.device_id, row.status));
        setAvailability(next);
      })
      .catch(() => {
        if (!active) return;
        const fallback = new Map<string, "free" | "booked">();
        [...PS5_ROW, ...VR_PODS, SIM_RIG].forEach((station) => fallback.set(station.id, "free"));
        setAvailability(fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, selectedHour]);

  const statusFor = (station: Station): StationStatus => {
    if (loading) return "loading";
    return availability.get(station.id) === "booked" ? "booked" : "free";
  };

  const selectedStation = getStation(selectedId ?? undefined);
  const selectedDay = days.find((day) => day.value === selectedDate) ?? days[0];

  const openCount = useMemo(
    () =>
      [...PS5_ROW, ...VR_PODS, SIM_RIG].filter(
        (station) => availability.get(station.id) !== "booked"
      ).length,
    [availability]
  );

  const handleSelect = (id: string) =>
    setSelectedId((current) => (current === id ? null : id));

  const summary =
    selectedStation && selectedDay ? (
      <SelectionSummary
        dateIso={selectedDate}
        dateLabel={selectedDay.date}
        hour={selectedHour}
        station={selectedStation}
      />
    ) : null;

  return (
    <CustomerLayout>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-obsidian-elevated px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-available" />
          </span>
          <span className="font-heading text-headline-sm text-on-surface">Floor Grid Live</span>
          <span className="text-body-sm text-on-surface-variant">
            {loading ? "syncing" : `${openCount} of 6 open`}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface-container px-2 py-1">
          <span
            className="material-symbols-outlined text-[16px] text-frost-cyan"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span className="text-label-badge uppercase tracking-wider text-frost-cyan">
            Fast hold · 10m lock
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5">
          {/* Date + kickoff */}
          <section className="flex flex-col gap-3">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              {days.map((day) => {
                const active = day.value === selectedDate;
                return (
                  <button
                    key={day.value}
                    aria-pressed={active}
                    className={cn(
                      "flex h-[60px] min-w-[76px] shrink-0 flex-col items-center justify-center rounded-xl px-2 transition-transform active:scale-95",
                      active
                        ? "bg-primary text-on-primary shadow-lg"
                        : "bg-obsidian-elevated text-on-surface-variant hover:text-on-surface"
                    )}
                    onClick={() => setSelectedDate(day.value)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "text-label-badge uppercase tracking-widest",
                        active ? "opacity-80" : "opacity-60"
                      )}
                    >
                      {day.weekday}
                    </span>
                    <span
                      className={cn(
                        "font-heading text-headline-sm font-bold",
                        active ? "text-on-primary" : "text-on-surface"
                      )}
                    >
                      {day.date}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">
                  Session kickoff
                </span>
                <span className="text-body-sm text-frost-cyan">Zone peak: 6 PM – 11 PM</span>
              </div>
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                {TIME_SLOTS.map((hour) => {
                  const active = hour === selectedHour;
                  return (
                    <button
                      key={hour}
                      aria-pressed={active}
                      className={cn(
                        "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 font-heading text-label-action whitespace-nowrap transition-all active:scale-95",
                        active
                          ? "bg-frost-cyan px-4 text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.45)]"
                          : "bg-obsidian-elevated text-on-surface-variant"
                      )}
                      onClick={() => setSelectedHour(hour)}
                      type="button"
                    >
                      {active ? <span className="h-1.5 w-1.5 rounded-full bg-obsidian-root" /> : null}
                      {hourLabel(hour)}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Arena map */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-frost-cyan">map</span>
                <h2 className="font-heading text-headline-sm tracking-tight text-on-surface">
                  Interactive arena map
                </h2>
              </div>
              <span className="text-label-badge uppercase text-on-surface-variant">
                Tap station to select
              </span>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl bg-obsidian-elevated p-2 shadow-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(#00E5FF 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1 text-label-badge uppercase tracking-wider text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] text-frost-cyan">
                        tv
                      </span>
                      PlayStation 5 Pro OLED row
                    </span>
                    <span className="text-label-badge text-frost-sky">Stage North</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PS5_ROW.map((station) => (
                      <StationTile
                        key={station.id}
                        onSelect={handleSelect}
                        selected={selectedId === station.id}
                        station={station}
                        status={statusFor(station)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 rounded-xl bg-surface-container p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-label-badge uppercase tracking-wider text-frost-cyan">
                        <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                        VR zone arena
                      </span>
                      <span className="text-label-badge text-on-surface-variant">
                        Omni motion mats
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {VR_PODS.map((station) => (
                        <StationTile
                          key={station.id}
                          onSelect={handleSelect}
                          selected={selectedId === station.id}
                          station={station}
                          status={statusFor(station)}
                        />
                      ))}
                    </div>
                  </div>

                  <StationTile
                    onSelect={handleSelect}
                    selected={selectedId === SIM_RIG.id}
                    station={SIM_RIG}
                    status={statusFor(SIM_RIG)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Games shortcut */}
          <Link
            className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-obsidian-elevated p-3 transition-all hover:border-frost-cyan/40 active:scale-[0.99]"
            href="/customer/booking/games"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-frost-cyan/10 text-frost-cyan">
                <span className="material-symbols-outlined text-[22px]">sports_esports</span>
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-heading text-headline-sm text-on-surface">
                  Browse installed PS games
                </span>
                <span className="truncate text-body-sm text-on-surface-variant">
                  {GAMES.slice(0, 3)
                    .map((game) => game.title)
                    .join(", ")}{" "}
                  &amp; {GAMES.length - 3} more
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined shrink-0 pl-2 text-[20px] text-frost-cyan">
              chevron_right
            </span>
          </Link>

          {/* Hardware bento */}
          <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {[
              {
                icon: "headset_mic",
                title: "Sony Pulse 3D",
                note: "Sanitised earcups ready",
                tone: "text-frost-cyan",
              },
              {
                icon: "sports_esports",
                title: "DualSense Edge",
                note: "Zero stick-drift tuned",
                tone: "text-secondary",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2 rounded-xl bg-obsidian-elevated p-3"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container",
                    item.tone
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-heading text-headline-sm text-on-surface">
                    {item.title}
                  </span>
                  <span className="truncate text-body-sm text-on-surface-variant">{item.note}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Clearance for the mobile drawer */}
          {summary ? <div aria-hidden className="h-40 lg:hidden" /> : null}
        </div>

        {/* Desktop summary column */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{summary}</div>
        </aside>
      </div>

      {/* Mobile / tablet summary drawer */}
      {summary ? (
        <aside className="fixed inset-x-0 bottom-20 z-40 px-4 md:px-10 lg:hidden">
          <div className="mx-auto w-full max-w-app">{summary}</div>
        </aside>
      ) : null}
    </CustomerLayout>
  );
}

function SelectionSummary({
  station,
  hour,
  dateIso,
  dateLabel,
}: {
  station: Station;
  hour: number;
  dateIso: string;
  dateLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-frost-cyan/20 bg-obsidian-elevated/95 p-3 shadow-cart backdrop-blur-2xl">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-frost-cyan/15 text-frost-cyan">
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-heading text-headline-sm font-bold text-on-surface">
              {station.code} selected
            </span>
            <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-label-badge uppercase text-frost-sky">
              {station.screen}
            </span>
          </div>
          <span className="truncate text-body-sm text-on-surface-variant">
            {dateLabel} · {hourLabel(hour)} start
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-0.5 text-label-badge uppercase tracking-wider text-frost-cyan">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          From ₹{station.ratePerHour}/h
        </span>
        <span className="text-body-sm text-status-available">Ready to configure</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Link
          className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-surface-container px-3 font-heading text-label-action text-on-surface transition-all hover:text-frost-cyan active:scale-95"
          href="/customer/booking/games"
        >
          <span className="material-symbols-outlined text-[18px]">sports_esports</span>
          <span className="text-xs">Games</span>
        </Link>
        <Link
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-container font-heading text-label-action uppercase tracking-wider text-on-primary-container shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
          href={`/customer/booking/${station.id}?date=${dateIso}&time=${slotValue(hour)}`}
        >
          Pick slots &amp; players
          <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

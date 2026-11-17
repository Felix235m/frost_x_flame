"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getAvailability, type AvailabilityItem } from "@/lib/actions/bookings";
import { CustomerLayout } from "@/components/customer/layout";
import { StationTile, type StationStatus } from "@/components/customer/station-tile";
import {
  PS5_ROW,
  SIM_RIG,
  STATIONS,
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

interface FloorZone {
  key: string;
  title: string;
  icon: string;
  stations: Station[];
}

/**
 * The floor is read as three zones, each a band of horizontal station strips.
 * Strip layout (not a grid) is what keeps every station readable on a phone.
 */
const FLOOR_ZONES: FloorZone[] = [
  { key: "stage-north", title: "Stage North", icon: "tv", stations: PS5_ROW },
  { key: "vr-zone", title: "VR Zone Arena", icon: "view_in_ar", stations: VR_PODS },
  { key: "sim-bay", title: "Sim Bay", icon: "sports_score", stations: [SIM_RIG] },
];

/**
 * `get_availability` reports device UUIDs plus the seeded device name, but the
 * booking flow keys stations by `station.id`. Match on type + name so a booked
 * slot actually reaches its strip ("Racing Sim" ↔ "Racing Simulator").
 * Unmatched devices stay unknown, which the caller treats as open.
 */
function mapAvailability(rows: AvailabilityItem[]): Map<string, "free" | "booked"> {
  const next = new Map<string, "free" | "booked">();

  rows.forEach((row) => {
    const name = (row.name ?? "").trim().toLowerCase();
    const station = STATIONS.find(
      (candidate) =>
        candidate.type === row.type &&
        (candidate.code.toLowerCase() === name || name.startsWith(candidate.code.toLowerCase()))
    );
    if (station) next.set(station.id, row.status);
  });

  return next;
}

export function ArenaFloorPlan({ days }: ArenaFloorPlanProps) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.value ?? "");
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Map<string, "free" | "booked">>(new Map());
  const [loading, setLoading] = useState(true);
  const hourRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAvailability(selectedDate, slotValue(selectedHour), 1)
      .then((rows) => {
        if (!active) return;
        setAvailability(mapAvailability(rows));
      })
      .catch(() => {
        if (!active) return;
        const fallback = new Map<string, "free" | "booked">();
        STATIONS.forEach((station) => fallback.set(station.id, "free"));
        setAvailability(fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, selectedHour]);

  // The session starts at 6 PM by default, which sits far along the hour rail.
  useEffect(() => {
    const row = hourRowRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!active) return;

    const rowRect = row.getBoundingClientRect();
    const chipRect = active.getBoundingClientRect();
    row.scrollTo({
      left: row.scrollLeft + (chipRect.left - rowRect.left) - (rowRect.width - chipRect.width) / 2,
      behavior: "smooth",
    });
  }, [selectedHour]);

  const statusFor = (station: Station): StationStatus => {
    if (loading) return "loading";
    return availability.get(station.id) === "booked" ? "booked" : "free";
  };

  const selectedStation = getStation(selectedId ?? undefined);
  const selectedDay = days.find((day) => day.value === selectedDate) ?? days[0];

  const openCount = useMemo(
    () => STATIONS.filter((station) => availability.get(station.id) !== "booked").length,
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
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Session: date and start time live in one well so the map starts sooner. */}
          <section
            aria-label="Session date and start time"
            className="flex flex-col gap-2 rounded-[18px] bg-obsidian-elevated p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
          >
            <div
              aria-label="Session date"
              className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-px"
              role="group"
            >
              {days.map((day) => {
                const active = day.value === selectedDate;
                return (
                  <button
                    key={day.value}
                    aria-pressed={active}
                    className={
                      active
                        ? "flex h-9 shrink-0 items-center gap-1.5 rounded-[9px] bg-primary px-2.5 text-on-primary shadow-[0_6px_16px_-8px_rgba(195,245,255,0.85)] transition-all active:scale-95"
                        : "flex h-9 shrink-0 items-center gap-1.5 rounded-[9px] bg-surface-container px-2.5 text-on-surface-variant transition-all hover:text-on-surface active:scale-95"
                    }
                    onClick={() => setSelectedDate(day.value)}
                    type="button"
                  >
                    <span
                      className={
                        active
                          ? "text-[9px] tracking-[0.1em] uppercase opacity-70"
                          : "text-[9px] tracking-[0.1em] text-on-surface-variant uppercase"
                      }
                    >
                      {day.weekday}
                    </span>
                    <span
                      className={
                        active
                          ? "font-heading text-xs font-semibold whitespace-nowrap text-on-primary"
                          : "font-heading text-xs font-semibold whitespace-nowrap text-on-surface"
                      }
                    >
                      {day.date}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              aria-label="Start time"
              className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-px"
              ref={hourRowRef}
              role="group"
            >
              {TIME_SLOTS.map((hour) => {
                const active = hour === selectedHour;
                return (
                  <button
                    key={hour}
                    aria-pressed={active}
                    className={
                      active
                        ? "flex h-8 shrink-0 items-center justify-center rounded-lg bg-frost-cyan px-3 font-heading text-xs font-semibold whitespace-nowrap text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.45)] transition-all active:scale-95"
                        : "flex h-8 shrink-0 items-center justify-center rounded-lg bg-surface-container px-3 font-heading text-xs font-semibold whitespace-nowrap text-on-surface-variant transition-all hover:text-on-surface active:scale-95"
                    }
                    onClick={() => setSelectedHour(hour)}
                    type="button"
                  >
                    {hourLabel(hour)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Arena map */}
          <section aria-labelledby="arena-map-title" className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <h2
                className="flex min-w-0 items-center gap-1.5 font-heading text-[17px] font-semibold tracking-[-0.01em] text-on-surface"
                id="arena-map-title"
              >
                <span className="material-symbols-outlined shrink-0 text-[18px] text-frost-cyan" aria-hidden>
                  map
                </span>
                <span className="truncate">Interactive arena map</span>
              </h2>
              <span className="flex shrink-0 items-center gap-1.5 text-[9.5px] tracking-[0.09em] whitespace-nowrap text-tertiary-fixed-dim uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-status-available shadow-[0_0_6px_#10B981]" />
                {loading ? "Syncing" : `${openCount} of ${STATIONS.length} open`}
              </span>
            </div>

            <div className="relative mt-2 overflow-hidden rounded-[20px] bg-surface-container-lowest p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_18px_30px_-18px_rgba(0,0,0,0.9)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.13]"
                style={{
                  backgroundImage: "radial-gradient(#00E5FF 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />
              <div className="relative z-10 flex flex-col gap-4">
                {FLOOR_ZONES.map((zone) => (
                  <div key={zone.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 border-b border-dashed border-white/5 pb-1.5">
                      <span className="material-symbols-outlined text-[13px] text-outline" aria-hidden>
                        {zone.icon}
                      </span>
                      <span className="font-heading text-[9.5px] font-semibold tracking-[0.13em] text-outline uppercase">
                        {zone.title}
                      </span>
                      <span className="ml-auto text-[9.5px] tracking-[0.04em] text-on-surface-variant/50">
                        {zone.stations.length} {zone.stations.length === 1 ? "station" : "stations"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {zone.stations.map((station) => (
                        <StationTile
                          key={station.id}
                          continueHref={`/customer/booking/${station.id}?date=${selectedDate}&time=${slotValue(selectedHour)}`}
                          onSelect={handleSelect}
                          selected={selectedId === station.id}
                          sessionHourLabel={hourLabel(selectedHour)}
                          station={station}
                          status={statusFor(station)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colour key: availability is the plate colour, so say what the colours mean. */}
            <div className="mt-2.5 flex items-center gap-2.5 text-[9.5px] tracking-[0.08em] text-on-surface-variant/55 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-[2px] bg-status-available shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                Open
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-[2px] bg-status-booked/45 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.7)]" />
                Booked
              </span>
              <span className="ml-auto text-[10px] tracking-normal text-on-surface-variant/40 normal-case">
                Tap a station to select
              </span>
            </div>

            <Link
              className="mt-3 flex items-center gap-2 rounded-xl bg-obsidian-elevated px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] transition-colors hover:bg-surface-container"
              href="/customer/booking/games"
            >
              <span className="material-symbols-outlined text-[17px] text-frost-cyan" aria-hidden>
                sports_esports
              </span>
              <span className="font-heading text-xs font-semibold text-on-surface">Installed games</span>
              <span className="ml-auto text-[10px] text-on-surface-variant/55">{GAMES.length} titles</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50" aria-hidden>
                chevron_right
              </span>
            </Link>
          </section>
        </div>

        {/* Desktop keeps the roomier summary; phones get the in-place strip actions. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{summary}</div>
        </aside>
      </div>
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
        <span className="flex items-center gap-1 text-label-badge uppercase tracking-wider text-frost-cyan">
          <span className="material-symbols-outlined text-[13px]">payments</span>₹{station.soloRatePerHour}
          <span className="text-on-surface-variant">/ player / hr</span>
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

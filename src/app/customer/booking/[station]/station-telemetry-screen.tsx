"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDeviceDayTimeline } from "@/lib/actions/bookings";
import { CustomerLayout } from "@/components/customer/layout";
import { BookingHeader } from "@/components/customer/booking-header";
import { cn } from "@/lib/utils";
import {
  PLAYER_TIERS,
  TIME_SLOTS,
  formatLongDate,
  getTier,
  hourLabel,
  hourLabelLong,
  rangeLabel,
  slotValue,
  type PlayerTier,
  type Station,
} from "@/lib/content/booking";
import { GAMES } from "@/lib/content/games";

type SlotStatus = "free" | "booked" | "held";

export interface StationTelemetryScreenProps {
  station: Station;
  date: string;
  initialHour: number;
}

export function StationTelemetryScreen({
  station,
  date,
  initialHour,
}: StationTelemetryScreenProps) {
  const tiers = PLAYER_TIERS[station.type];
  const [players, setPlayers] = useState(station.defaultPlayers);
  const [selectedHours, setSelectedHours] = useState<number[]>([initialHour]);
  const [timeline, setTimeline] = useState<Map<number, SlotStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getDeviceDayTimeline(station.id, date)
      .then((rows) => {
        if (!active) return;
        const next = new Map<number, SlotStatus>();
        rows.forEach((row) => next.set(row.hour, row.status));
        setTimeline(next);
      })
      .catch(() => {
        if (!active) return;
        const fallback = new Map<number, SlotStatus>();
        TIME_SLOTS.forEach((hour) => fallback.set(hour, "free"));
        setTimeline(fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [station.id, date]);

  // Once the day's timeline lands, drop any selected hour that is no longer free.
  useEffect(() => {
    if (loading) return;
    setSelectedHours((previous) => {
      const free = previous.filter((hour) => (timeline.get(hour) ?? "free") === "free");
      if (free.length > 0) return free;
      const firstFree = TIME_SLOTS.find((hour) => (timeline.get(hour) ?? "free") === "free");
      return firstFree === undefined ? previous : [firstFree];
    });
  }, [loading, timeline]);

  const tier = getTier(station.type, players);
  const startHour = Math.min(...selectedHours);
  const hours = selectedHours.length;
  const total = tier.ratePerHour * hours;

  const slotStatus = (hour: number): SlotStatus => timeline.get(hour) ?? "free";

  const toggleSlot = (hour: number) => {
    if (slotStatus(hour) !== "free") return;

    setSelectedHours((previous) => {
      if (previous.includes(hour)) {
        if (previous.length === 1) return previous;
        // Only the ends can be dropped, so the booking always stays one block.
        const min = Math.min(...previous);
        const max = Math.max(...previous);
        if (hour === min || hour === max) {
          return previous.filter((value) => value !== hour);
        }
        return previous;
      }

      const min = Math.min(...previous);
      const max = Math.max(...previous);

      if (hour === min - 1 || hour === max + 1) {
        return [...previous, hour].sort((a, b) => a - b);
      }

      return [hour];
    });
  };

  const checkoutHref = useMemo(
    () =>
      `/customer/checkout?station=${station.id}&players=${players}&start=${slotValue(startHour)}&hours=${hours}&date=${date}`,
    [station.id, players, startHour, hours, date]
  );

  return (
    <CustomerLayout variant="focused">
      <BookingHeader backHref="/customer/booking" title="Station Telemetry" />

      <main className="mx-auto w-full max-w-app px-4 pt-16 pb-44 md:px-10">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 py-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-frost-cyan/30 bg-surface-container-high px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-status-available shadow-[0_0_8px_#10B981]" />
            <span className="text-label-badge uppercase tracking-wider text-frost-cyan">
              {station.code} · {station.rig}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-tertiary">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sensors
            </span>
            <span className="text-label-badge tracking-tight">Telemetry ready</span>
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="flex flex-col">
            {/* Hero */}
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-obsidian-elevated shadow-xl">
              <div className="relative h-48 w-full">
                <img
                  alt={station.imageAlt}
                  className="h-full w-full object-cover"
                  src={station.image}
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian-elevated via-obsidian-elevated/40 to-transparent" />
                {station.flagship ? (
                  <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-flame-neon/40 bg-obsidian-root/80 px-2.5 py-1 backdrop-blur-md">
                    <span
                      className="material-symbols-outlined text-[16px] text-flame-neon"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      local_fire_department
                    </span>
                    <span className="text-label-badge text-on-surface">Flagship rig</span>
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-headline-md tracking-tight text-on-surface">
                      {station.code} – {station.typeLabel}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1 text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-status-available">
                        check_circle
                      </span>
                      Available for instant lock
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-label-badge uppercase tracking-wider text-outline">
                      Base tier
                    </span>
                    <span className="font-heading text-label-timer text-frost-cyan">
                      ₹{tier.ratePerHour}
                      <span className="text-body-sm font-normal text-on-surface-variant">/hr</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {station.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center gap-2 rounded-lg bg-surface-container-high/80 p-2.5"
                    >
                      <span
                        className={cn("material-symbols-outlined text-[18px]", spec.colorClass)}
                      >
                        {spec.icon}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-label-badge text-on-surface">
                          {spec.label}
                        </span>
                        <span className="truncate text-body-sm text-outline">{spec.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Players */}
            <section className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-frost-cyan">groups</span>
                  <h3 className="font-heading text-headline-sm text-on-surface">Number of players</h3>
                </div>
                <span className="text-label-badge uppercase tracking-wide text-on-surface-variant">
                  Dynamic pricing
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {tiers.map((option) => (
                  <TierCard
                    key={option.players}
                    active={option.players === players}
                    onSelect={() => setPlayers(option.players)}
                    tier={option}
                  />
                ))}
              </div>
            </section>

            {/* Time slots */}
            <section className="mt-6 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-flame-neon">
                    calendar_today
                  </span>
                  <h3 className="font-heading text-headline-sm text-on-surface">
                    Time slots &amp; availability
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-container-high px-2.5 py-1">
                  <span className="text-label-badge text-frost-cyan">
                    {loading ? "Syncing…" : formatLongDate(date)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">10 AM – 1 AM</span>
                </span>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-obsidian-elevated p-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <LegendDot className="bg-status-available shadow-[0_0_8px_#10B981]" label="Available" />
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-surface-container-highest text-outline">
                      <span className="material-symbols-outlined text-[10px]">lock</span>
                    </span>
                    <span className="text-[12px] text-outline">Booked (locked)</span>
                  </span>
                  <LegendDot
                    className="bg-frost-cyan shadow-[0_0_8px_#00E5FF]"
                    label={`Selected (${hours} ${hours === 1 ? "hr" : "hrs"})`}
                    tone="text-frost-cyan"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {TIME_SLOTS.map((hour) => {
                    const status = slotStatus(hour);
                    const active = selectedHours.includes(hour);
                    const isStart = active && hour === startHour;
                    const isEnd = active && hours > 1 && hour === startHour + hours - 1;

                    if (status !== "free") {
                      return (
                        <div
                          key={hour}
                          className="flex cursor-not-allowed flex-col items-center justify-between rounded-xl border border-surface-container-highest/60 bg-surface-container-lowest/60 p-2.5 text-center opacity-45"
                        >
                          <span className="text-[11px] text-outline">{hourLabel(hour)}</span>
                          <span className="material-symbols-outlined my-1 text-[16px] text-status-booked">
                            lock
                          </span>
                          <span className="text-[9px] font-semibold text-status-booked">
                            {status === "held" ? "HELD" : "BOOKED"}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={hour}
                        aria-label={`${hourLabelLong(hour)} ${active ? "selected" : "available"}`}
                        aria-pressed={active}
                        className={cn(
                          "relative flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition-all",
                          active
                            ? "border-frost-cyan bg-surface-container-highest shadow-[0_0_14px_rgba(0,229,255,0.4)]"
                            : "border-border-subtle bg-surface-container hover:border-status-available/50"
                        )}
                        onClick={() => toggleSlot(hour)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "text-[11px]",
                            active ? "font-bold text-frost-cyan" : "text-tertiary"
                          )}
                        >
                          {hourLabel(hour)}
                        </span>
                        <span
                          className={cn(
                            "material-symbols-outlined my-1",
                            active ? "text-[18px] text-frost-cyan" : "text-[16px] text-status-available"
                          )}
                          style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {active ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        {active ? (
                          <span
                            className={cn(
                              "rounded px-1.5 text-[9px] font-bold",
                              isStart
                                ? "bg-frost-cyan text-obsidian-root"
                                : isEnd
                                  ? "border border-frost-cyan/50 text-frost-cyan"
                                  : "border border-frost-cyan/40 text-frost-cyan"
                            )}
                          >
                            {isStart ? "START" : isEnd ? `END ${hourLabel(hour + 1)}` : "HR"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant">OPEN</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-container/70 p-3">
                  <span className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-frost-cyan">info</span>
                    Selected:{" "}
                    <strong className="font-semibold text-on-surface">
                      {rangeLabel(startHour, hours)} ({hours} {hours === 1 ? "hour" : "hours"})
                    </strong>
                  </span>
                  <span className="rounded border border-tertiary/20 bg-tertiary/10 px-2 py-0.5 text-[11px] text-tertiary">
                    Instant confirm
                  </span>
                </div>
              </div>
            </section>

            {/* Library */}
            <section className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-frost-cyan">
                    sports_esports
                  </span>
                  <h3 className="font-heading text-headline-sm text-on-surface">Station library</h3>
                </div>
                <span className="text-label-badge text-tertiary">{GAMES.length} installed</span>
              </div>

              <Link
                className="flex flex-col gap-3 rounded-xl border border-frost-cyan/30 bg-linear-to-r from-obsidian-elevated via-surface-container to-obsidian-card p-4 shadow-lg transition-all hover:border-frost-cyan active:scale-[0.99]"
                href="/customer/booking/games"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-frost-cyan/40 bg-primary-container/10 text-frost-cyan">
                    <span className="material-symbols-outlined text-[22px]">videogame_asset</span>
                  </span>
                  <div>
                    <h4 className="flex items-center gap-1.5 font-heading text-label-action text-on-surface">
                      View full PS games library ({GAMES.length} titles)
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </h4>
                    <p className="text-body-sm text-on-surface-variant">
                      Includes latest Day-1 PS5 Pro enhanced editions &amp; save sync
                    </p>
                  </div>
                </div>
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pt-1">
                  {GAMES.slice(0, 3).map((game) => (
                    <span
                      key={game.title}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-container-high/90 px-2.5 py-1.5"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-obsidian-root text-[8px] font-bold text-frost-cyan">
                        {game.monogram.slice(0, 2)}
                      </span>
                      <span className="text-[11px] text-on-surface">{game.title}</span>
                    </span>
                  ))}
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-container-high/90 px-2.5 py-1.5 text-frost-cyan">
                    <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    <span className="text-[11px]">+{GAMES.length - 3} more</span>
                  </span>
                </div>
              </Link>
            </section>
          </div>

          {/* Desktop summary rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border-subtle bg-obsidian-elevated p-4 shadow-cart">
              <p className="text-label-badge uppercase tracking-wider text-outline">Session total</p>
              <p className="mt-1 font-heading text-headline-lg text-frost-cyan">₹{total}</p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {station.code} · {tier.label} · {hours} {hours === 1 ? "hour" : "hours"}
              </p>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                {rangeLabel(startHour, hours)}
              </p>
              <Link
                className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-flame-neon to-flame-amber font-heading text-label-action uppercase tracking-wider text-obsidian-root shadow-neon-flame"
                href={checkoutHref}
              >
                Proceed to checkout
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-obsidian-root/95 px-4 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.85)] backdrop-blur-xl md:px-10">
        <div className="mx-auto w-full max-w-app py-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-held" />
              <span className="text-label-badge text-status-held">Instant hold</span>
              <span className="text-[12px] text-outline">•</span>
              <span className="text-[12px] font-medium text-on-surface">
                {tier.players} {tier.players === 1 ? "Player" : "Players"} ({tier.label})
              </span>
            </div>
            <span className="text-[12px] font-medium text-frost-cyan">
              {rangeLabel(startHour, hours)} ({hours} {hours === 1 ? "hr" : "hrs"})
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              aria-label="Back to floor map"
              className="flex h-[54px] w-14 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-obsidian-elevated text-on-surface shadow-md transition-all hover:text-frost-cyan active:scale-95"
              href="/customer/booking"
            >
              <span className="material-symbols-outlined text-[24px]">map</span>
            </Link>
            <Link
              className="flex h-[54px] flex-1 items-center justify-between gap-2 rounded-xl bg-linear-to-r from-flame-neon via-flame-amber to-flame-neon px-4 font-bold text-obsidian-root shadow-neon-flame transition-all hover:brightness-105 active:scale-[0.98]"
              href={checkoutHref}
            >
              <span className="flex flex-col items-start leading-tight">
                <span className="font-heading text-label-action uppercase tracking-wider">
                  Proceed to checkout
                </span>
                <span className="text-body-sm font-semibold">
                  {station.code} • {tier.label} • {hours} {hours === 1 ? "Hour" : "Hours"}
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-obsidian-root/20 px-3 py-1.5">
                <span className="font-heading text-headline-sm">₹{total}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function TierCard({
  tier,
  active,
  onSelect,
}: {
  tier: PlayerTier;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
        active
          ? "border-frost-cyan/60 bg-surface-container-high shadow-[0_0_16px_rgba(0,229,255,0.25)]"
          : "border-border-subtle bg-surface-container shadow-sm hover:border-frost-cyan/40"
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex w-full items-center justify-between gap-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "material-symbols-outlined text-[16px]",
              active ? "text-frost-cyan" : "text-outline"
            )}
          >
            {tier.icon}
          </span>
          <span
            className={cn(
              "font-heading text-label-action",
              active ? "text-frost-cyan" : "text-on-surface"
            )}
          >
            {tier.label} ({tier.players} {tier.players === 1 ? "Player" : "Players"})
          </span>
          {tier.popular ? (
            <span className="rounded bg-frost-cyan/20 px-1.5 text-label-badge text-[10px] text-frost-cyan">
              POPULAR
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "material-symbols-outlined text-[18px]",
            active ? "text-frost-cyan" : "text-outline opacity-0"
          )}
          style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          check_circle
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={cn(
            "font-heading text-headline-sm",
            active ? "text-frost-cyan" : "text-primary"
          )}
        >
          ₹{tier.ratePerHour}
        </span>
        <span className="text-body-sm text-on-surface-variant">/ hr</span>
      </div>
      <span className="mt-0.5 text-body-sm text-outline">{tier.note}</span>
    </button>
  );
}

function LegendDot({
  label,
  className,
  tone = "text-on-surface-variant",
}: {
  label: string;
  className: string;
  tone?: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      <span className={cn("text-[12px]", tone)}>{label}</span>
    </span>
  );
}

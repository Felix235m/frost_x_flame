"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/content/brand";
import type { Station } from "@/lib/content/booking";

export type StationStatus = "free" | "booked" | "loading";

export interface StationTileProps {
  station: Station;
  status: StationStatus;
  selected: boolean;
  /** Label of the hour the floor is showing, e.g. "6 PM". */
  sessionHourLabel: string;
  /** Continue target for this station; the inline actions need it. */
  continueHref: string;
  onSelect: (id: string) => void;
}

const STATION_GLYPHS: Record<Station["type"], string> = {
  ps5: "videogame_asset",
  vr: "view_in_ar",
  sim: "sports_score",
};

/** One line of hardware spec, so a strip never needs to explain itself twice. */
function specLine(station: Station): string {
  if (station.type === "ps5") return `${station.screen} · ${station.maxPlayers} pads`;
  if (station.type === "vr") return `${station.rig} · 1 headset`;
  return station.rig;
}

export function StationTile({
  station,
  status,
  selected,
  sessionHourLabel,
  continueHref,
  onSelect,
}: StationTileProps) {
  const booked = status === "booked";
  const syncing = status === "loading";
  const disabled = booked || syncing;
  const active = selected && !booked;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(station.id);
    }
  };

  const handleNotify = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={cn(
        "rounded-[14px] transition-[background,box-shadow] duration-200",
        active
          ? "bg-linear-to-b from-frost-cyan/16 to-frost-cyan/5 shadow-[inset_0_0_0_1px_rgba(0,229,255,0.45),0_12px_28px_-14px_rgba(0,229,255,0.8),0_0_0_3px_rgba(0,229,255,0.05)]"
          : booked
            ? "bg-linear-to-b from-status-booked/7 to-obsidian-root/25 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.16)]"
            : "bg-linear-to-b from-status-available/15 to-status-available/5 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.26),0_10px_20px_-14px_rgba(16,185,129,0.9)]"
      )}
    >
      <div
        aria-disabled={disabled}
        aria-label={`${station.code}, ${booked ? "booked" : "open"}, ₹${station.soloRatePerHour} per player per hour`}
        aria-pressed={active}
        className={cn(
          "flex min-h-[52px] items-center gap-2.5 rounded-[14px] px-2.5 py-2.5 transition-transform duration-150",
          disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.985]"
        )}
        onClick={() => {
          if (!disabled) onSelect(station.id);
        }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={cn(
            "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-frost-cyan/20 text-frost-cyan"
              : booked
                ? "bg-status-booked/10 text-status-booked/75"
                : "bg-status-available/20 text-tertiary-fixed-dim"
          )}
        >
          <span className="material-symbols-outlined text-[17px]" aria-hidden>
            {booked ? "lock" : STATION_GLYPHS[station.type]}
          </span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              "truncate font-heading text-[15px] leading-tight font-semibold",
              booked
                ? "text-on-surface/50 line-through decoration-status-booked/60 decoration-[1.5px]"
                : "text-on-surface"
            )}
          >
            {station.code}
          </span>
          <span
            className={cn(
              "truncate text-[10.5px] leading-tight",
              booked
                ? "text-status-booked/70"
                : station.type === "sim"
                  ? "text-flame-amber"
                  : "text-on-surface-variant/70"
            )}
          >
            {booked ? `Booked at ${sessionHourLabel}` : specLine(station)}
          </span>
        </span>

        {syncing ? (
          <span className="ml-auto flex shrink-0 flex-col items-end gap-1">
            <span className="h-4 w-12 animate-pulse rounded-xs bg-surface-container-high" />
            <span className="h-2 w-14 animate-pulse rounded-xs bg-surface-container" />
          </span>
        ) : booked ? (
          <a
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md py-1 text-[10.5px] font-medium text-status-booked/90 transition-colors hover:text-status-booked"
            href={whatsappLink(`Notify me when ${station.code} frees up at Frost x Flame`)}
            onClick={handleNotify}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined text-[14px]" aria-hidden>
              notifications
            </span>
            Notify
          </a>
        ) : (
          <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
            <span
              className={cn(
                "text-tabular-nums font-heading text-[17px] leading-none font-bold",
                active ? "text-frost-cyan" : "text-tertiary-fixed-dim"
              )}
            >
              ₹{station.soloRatePerHour}
            </span>
            <span
              className={cn(
                "text-[8.5px] tracking-[0.05em] whitespace-nowrap uppercase",
                active ? "text-frost-cyan/70" : "text-on-surface/45"
              )}
            >
              per player/hr
            </span>
          </span>
        )}
      </div>

      {active ? (
        /* Phones get the action inline; desktop has the summary column instead. */
        <div className="flex gap-2 px-2.5 pb-2.5 lg:hidden">
          <Link
            className="inline-flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-surface-container-high/80 px-3 font-heading text-xs font-semibold text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
            href="/customer/booking/games"
          >
            <span className="material-symbols-outlined text-[16px] text-frost-cyan" aria-hidden>
              sports_esports
            </span>
            Games
          </Link>
          <Link
            className="inline-flex h-[42px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-frost-cyan font-heading text-xs font-semibold whitespace-nowrap text-obsidian-root shadow-[0_8px_18px_-8px_rgba(0,229,255,0.95)] transition-all hover:brightness-110 active:scale-[0.98]"
            href={continueHref}
          >
            Pick slots &amp; players
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              arrow_forward
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

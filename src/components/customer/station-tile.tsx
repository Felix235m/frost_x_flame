"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/content/brand";
import type { Station } from "@/lib/content/booking";

export type StationStatus = "free" | "booked" | "loading";

export interface StationTileProps {
  station: Station;
  status: StationStatus;
  selected: boolean;
  onSelect: (id: string) => void;
}

function RateRow({
  station,
  tone,
}: {
  station: Station;
  tone: "selected" | "free" | "locked";
}) {
  return (
    <div
      className={cn(
        "mt-2 flex items-center justify-between gap-1 rounded-lg px-1.5 py-1",
        tone === "locked" ? "bg-obsidian-root/50" : "bg-obsidian-root"
      )}
    >
      <span className="shrink-0 text-[10px] whitespace-nowrap text-on-surface-variant">Rate</span>
      <span
        className={cn(
          "ml-auto font-heading text-[12px] font-bold whitespace-nowrap",
          tone === "locked"
            ? "font-normal text-on-surface-variant"
            : tone === "selected"
              ? "text-frost-cyan"
              : "text-status-available"
        )}
      >
        ₹{station.ratePerHour}
        <span className="text-[10px] font-normal text-on-surface-variant">/h</span>
      </span>
    </div>
  );
}

function StatusBadge({ status, selected }: { status: StationStatus; selected: boolean }) {
  if (status === "loading") {
    return (
      <span className="animate-pulse rounded-full bg-surface-container-high px-1.5 py-0.5 text-label-badge uppercase tracking-wider text-outline">
        Sync
      </span>
    );
  }

  if (status === "booked") {
    return (
      <span className="rounded-full bg-status-booked/20 px-1.5 py-0.5 text-label-badge uppercase tracking-wider text-status-booked">
        Booked
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-label-badge uppercase tracking-wider",
        selected
          ? "bg-obsidian-root text-frost-cyan"
          : "bg-status-available/20 text-status-available"
      )}
    >
      {selected ? "Active" : "Available"}
    </span>
  );
}

export function StationTile({ station, status, selected, onSelect }: StationTileProps) {
  const booked = status === "booked";
  const disabled = booked || status === "loading";
  const interactiveProps = {
    role: "button" as const,
    tabIndex: disabled ? -1 : 0,
    "aria-pressed": selected,
    "aria-disabled": disabled,
    "aria-label": `${station.code}, ${status === "booked" ? "booked" : "available"}, ₹${station.ratePerHour} per hour`,
    onClick: () => {
      if (!disabled) onSelect(station.id);
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(station.id);
      }
    },
  };

  if (station.type === "sim") {
    return (
      <div
        {...interactiveProps}
        className={cn(
          "flex flex-col rounded-xl bg-surface-container p-3 transition-all",
          selected
            ? "ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.35)]"
            : booked
              ? "cursor-not-allowed opacity-60 shadow-[0_0_20px_rgba(255,85,0,0.12)]"
              : "cursor-pointer shadow-[0_0_20px_rgba(255,85,0,0.22)] hover:bg-surface-container-high active:scale-95"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary-container text-on-secondary shadow-md">
              <span className="material-symbols-outlined text-[18px]">sports_score</span>
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-heading text-headline-sm leading-tight font-bold text-on-surface">
                {station.code}
              </span>
              <span className="truncate text-body-sm font-medium text-flame-amber">
                {station.rig}
              </span>
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-label-badge font-bold uppercase",
              selected
                ? "bg-frost-cyan/20 text-frost-cyan"
                : booked
                  ? "bg-status-booked/20 text-status-booked"
                  : "bg-flame-amber/20 text-flame-amber"
            )}
          >
            {booked ? "Booked" : selected ? "Selected" : "Available"}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-obsidian-root px-2 py-1.5">
          <span className="text-body-sm text-on-surface-variant">Fanatec Direct Drive</span>
          <span className="font-heading text-label-action font-bold text-flame-neon">
            ₹{station.ratePerHour}
            <span className="text-[10px] font-normal text-on-surface-variant">/h</span>
          </span>
        </div>
      </div>
    );
  }

  if (station.type === "vr") {
    return (
      <div
        {...interactiveProps}
        className={cn(
          "flex flex-col justify-between rounded-lg p-2.5 transition-all",
          selected
            ? "cursor-pointer bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_20px_rgba(0,229,255,0.35)]"
            : booked
              ? "cursor-not-allowed bg-surface-container-lowest opacity-50"
              : "cursor-pointer bg-obsidian-elevated shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:bg-surface-container-high active:scale-95"
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className={cn(
              "font-heading text-headline-sm font-semibold text-on-surface",
              booked && "font-medium text-on-surface-variant line-through"
            )}
          >
            {station.code}
          </span>
          <StatusBadge selected={selected} status={status} />
        </div>
        <span className="mt-1.5 text-body-sm text-on-surface-variant">Omni Rig</span>
        <div
          className={cn(
            "mt-2 flex items-center justify-between border-t border-border-subtle pt-1",
            booked && "opacity-70"
          )}
        >
          <span className="text-body-sm text-on-surface-variant">Rate</span>
          <span
            className={cn(
              "font-heading text-label-action",
              booked ? "text-body-sm text-on-surface-variant" : "text-frost-cyan"
            )}
          >
            ₹{station.ratePerHour}
            <span className="text-[10px] font-normal text-on-surface-variant">/h</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      {...interactiveProps}
      className={cn(
        "relative flex flex-col justify-between rounded-xl p-2.5 transition-all duration-300",
        selected
          ? "cursor-pointer bg-surface-container-high shadow-[0_0_24px_rgba(0,229,255,0.45)] ring-2 ring-frost-cyan"
          : booked
            ? "cursor-not-allowed bg-surface-container-lowest opacity-60"
            : "cursor-pointer bg-surface-container shadow-[0_0_14px_rgba(16,185,129,0.15)] hover:bg-surface-container-high active:scale-95"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md shadow-sm",
            selected
              ? "bg-frost-cyan text-obsidian-root"
              : booked
                ? "bg-obsidian-root text-status-booked"
                : "bg-obsidian-root text-status-available"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">
            {booked ? "lock" : "videogame_asset"}
          </span>
        </span>
        <StatusBadge selected={selected} status={status} />
      </div>

      <div className="mt-2">
        <p
          className={cn(
            "font-heading text-headline-sm leading-tight",
            selected ? "font-bold text-on-surface" : booked ? "font-medium text-on-surface-variant line-through" : "font-semibold text-on-surface"
          )}
        >
          {station.code}
        </p>
        <p
          className={cn(
            "truncate text-body-sm",
            selected ? "text-frost-cyan" : "text-on-surface-variant"
          )}
        >
          {station.screen}
        </p>
      </div>

      {booked ? (
        <a
          className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-surface-container py-1 text-on-surface transition-colors hover:text-frost-cyan"
          href={whatsappLink(`Notify me when ${station.code} frees up at Frost x Flame`)}
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="material-symbols-outlined text-[12px]">notifications</span>
          <span className="text-[9px] text-label-badge uppercase tracking-wider">Notify</span>
        </a>
      ) : (
        <RateRow station={station} tone={selected ? "selected" : "free"} />
      )}
    </div>
  );
}

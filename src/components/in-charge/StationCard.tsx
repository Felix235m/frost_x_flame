"use client";

import { cn } from "@/lib/utils";

interface StationCardProps {
  name: string;
  type: string;
  status: "free" | "booked" | "running" | "upcoming";
  customer?: string | null;
  session?: string | null;
  amount?: number | null;
  onPress: () => void;
}

export function StationCard({
  name,
  type,
  status,
  customer,
  session,
  amount,
  onPress,
}: StationCardProps) {
  const statusConfig: Record<string, { label: string; variant: "available" | "held" | "booked" | "frost" | "flame" }> = {
    free: { label: "FREE", variant: "available" },
    running: { label: "LIVE", variant: "frost" },
    upcoming: { label: "UPCOMING", variant: "flame" },
    booked: { label: "BOOKED", variant: "booked" },
  };

  const config = statusConfig[status];
  const typeIcon: Record<string, string> = {
    ps5: "videogame_asset",
    vr: "view_in_ar",
    sim: "sports_score",
  };

  return (
    <button
      onClick={onPress}
      className={cn(
        "flex flex-col justify-between p-2.5 rounded-xl transition-all duration-300 active:scale-95 shadow-inner",
        status === "free"
          ? "bg-surface-container shadow-[0_0_18px_rgba(16,185,129,0.22)] hover:bg-surface-container-high"
          : status === "running"
            ? "bg-surface-container-high ring-2 ring-frost-cyan shadow-[0_0_24px_rgba(0,229,255,0.45)]"
            : status === "upcoming"
              ? "bg-surface-container-high shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "bg-surface-container-lowest opacity-60 cursor-not-allowed"
      )}
      type="button"
    >
      <div className="flex items-start justify-between">
        <div className="w-6 h-6 rounded-md bg-obsidian-root flex items-center justify-center text-status-available shadow-sm">
          <span className="material-symbols-outlined text-[14px]">{typeIcon[type] ?? "devices"}</span>
        </div>
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5", config.variant === "available" ? "bg-status-available/20 text-status-available" : config.variant === "held" ? "bg-status-held/20 text-status-held" : config.variant === "booked" ? "bg-status-booked/20 text-status-booked" : config.variant === "frost" ? "bg-frost-cyan/20 text-frost-cyan" : "bg-flame-neon/20 text-flame-neon", "font-heading text-label-badge uppercase tracking-wider")}>
          {config.label}
        </span>
      </div>
      <div className="mt-2">
        <p className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">{name}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{type.toUpperCase()}</p>
      </div>
      {customer && (
        <div className="mt-2 pt-1 flex items-center justify-between bg-obsidian-root/50 px-1.5 py-1 rounded-lg">
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{session ?? "--:--"}</span>
          <span className="font-label-action text-label-action text-frost-cyan font-bold tabular-nums">
            {amount != null ? `₹${amount}` : "—"}
          </span>
        </div>
      )}
      <div className="mt-auto pt-2 flex items-center justify-between gap-1 px-1">
        <span className="font-body-sm text-body-sm text-on-surface-variant">{customer ?? "No customer"}</span>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
      </div>
    </button>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "held" | "booked" | "frost" | "flame" | "tertiary";
}

export function Badge({ className, variant = "frost", ...props }: BadgeProps) {
  const variants = {
    available:
      "bg-status-available/20 text-status-available font-heading text-label-badge uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    held:
      "bg-status-held/20 text-status-held font-heading text-label-badge uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    booked:
      "bg-status-booked/20 text-status-booked font-heading text-label-badge uppercase tracking-wider",
    frost:
      "bg-frost-cyan/15 text-frost-cyan font-heading text-label-badge uppercase tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.3)]",
    flame:
      "bg-flame-neon/20 text-flame-neon font-heading text-label-badge uppercase tracking-wider shadow-[0_0_12px_rgba(255,85,0,0.3)]",
    tertiary:
      "bg-surface-container-high text-on-surface-variant font-heading text-label-badge uppercase tracking-wider",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

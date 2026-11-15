"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-heading transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-frost-cyan text-obsidian-root shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110",
        flame:
          "bg-linear-to-r from-flame-neon to-flame-amber text-obsidian-root shadow-[0_0_24px_rgba(255,85,0,0.4)] hover:brightness-110",
        secondary:
          "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high",
        ghost:
          "bg-transparent text-on-surface-variant hover:text-frost-cyan",
        danger:
          "bg-status-booked text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-110",
        outline:
          "border border-outline-variant text-on-surface hover:bg-surface-container-high",
      },
      size: {
        default: "h-12 px-4",
        sm: "h-10 px-3",
        lg: "h-14 px-6",
        full: "w-full h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={buttonVariants({ variant, size, className })} {...props} />
  );
}

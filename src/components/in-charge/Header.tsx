"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

interface HeaderProps {
  session: { name: string; role: string };
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-outline-variant/20 bg-obsidian-root/80 backdrop-blur-md px-space-md">
      <div className="flex items-center gap-2">
        <BrandLogo />
        <span className="font-heading text-label-action uppercase tracking-wider text-on-surface-variant hidden md:block">
          In-Charge Console
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5">
        <span className="material-symbols-outlined text-[18px] text-frost-cyan">person</span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-semibold text-on-surface">
            {session.name}
          </span>
          <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">
            {session.role}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          className="flex items-center justify-center gap-1 rounded-lg bg-surface-container px-2 py-1.5 text-on-surface transition-colors hover:bg-surface-container-high"
          href="/customer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span className="text-body-sm hidden sm:inline">Back to site</span>
        </Link>
      </div>
    </header>
  );
}

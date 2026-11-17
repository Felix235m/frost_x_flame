"use client";

import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/in-charge/floor" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-frost-cyan/20 text-frost-cyan shadow-[0_0_12px_rgba(0,229,255,0.35)]">
        <span className="material-symbols-outlined text-[16px]">videogame_asset</span>
      </span>
      <span className="font-heading text-headline-sm tracking-tight text-on-surface font-bold">
        Frost x Flame
      </span>
    </Link>
  );
}

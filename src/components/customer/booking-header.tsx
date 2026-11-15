"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND_LOGO } from "@/lib/content/brand";

export interface BookingHeaderProps {
  title: string;
  /** Explicit destination; falls back to browser history when omitted. */
  backHref?: string;
}

export function BookingHeader({ title, backHref }: BookingHeaderProps) {
  const router = useRouter();

  const backClasses =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-obsidian-elevated/80 text-on-surface transition-all hover:text-frost-cyan active:scale-95";

  return (
    <header className="pt-safe fixed inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-obsidian-root/85 shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-app items-center justify-between gap-2 px-4 md:px-10">
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link aria-label="Go back" className={backClasses} href={backHref}>
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          ) : (
            <button
              aria-label="Go back"
              className={backClasses}
              onClick={() => router.back()}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-container-lowest">
            <img alt="" className="h-full w-full object-cover" src={BRAND_LOGO} />
          </span>
          <h1 className="truncate font-heading text-headline-sm tracking-tight text-on-surface">
            {title}
          </h1>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <span className="material-symbols-outlined text-[18px] text-on-primary">person</span>
        </span>
      </div>
    </header>
  );
}

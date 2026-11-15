"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer/layout";
import { BookingHeader } from "@/components/customer/booking-header";
import { cn } from "@/lib/utils";
import { GAMES, GAME_FILTERS, type GameFilterId } from "@/lib/content/games";
import { whatsappLink } from "@/lib/content/brand";

export interface GamesLibraryProps {
  stationId?: string;
  stationCode?: string;
}

export function GamesLibrary({ stationId, stationCode }: GamesLibraryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GameFilterId>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GAMES.filter((game) => {
      const matchesFilter = filter === "all" || game.tags.includes(filter);
      const matchesQuery =
        needle.length === 0 ||
        game.title.toLowerCase().includes(needle) ||
        game.genre.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const pickHref = stationId ? `/customer/booking/${stationId}` : "/customer/booking";

  return (
    <CustomerLayout variant="focused">
      <BookingHeader backHref="/customer/booking" title="PS Games Library" />

      <main className="mx-auto w-full max-w-app px-4 pt-16 pb-40 md:px-10">
        <div className="flex flex-col gap-3 py-3">
          <div>
            <h2 className="font-heading text-headline-lg-mobile tracking-tight text-on-surface uppercase md:text-headline-lg">
              {GAMES.length} installed titles
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Every rig runs the same library with save sync between stations.
            </p>
          </div>

          <div className="relative">
            <label className="sr-only" htmlFor="game-search">
              Search all PS titles
            </label>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              className="h-12 w-full rounded-xl border border-border-subtle bg-obsidian-elevated pr-3 pl-11 text-body-md text-on-surface placeholder:text-outline focus:border-frost-cyan/50 focus:outline-hidden"
              id="game-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all PS titles, fighting, co-op…"
              type="search"
              value={query}
            />
          </div>

          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
            {GAME_FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 font-heading text-[11px] uppercase tracking-wider transition-all active:scale-95",
                    active
                      ? "bg-frost-cyan text-obsidian-root shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                      : "bg-obsidian-elevated text-on-surface-variant hover:text-on-surface"
                  )}
                  onClick={() => setFilter(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle bg-obsidian-elevated px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-frost-cyan">
              <span className="material-symbols-outlined text-[18px]">lan</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-label-action text-on-surface">Floor station</p>
              <p className="text-body-sm text-on-surface-variant">Installed on Station 1, 2 and 3</p>
            </div>
            <span className="shrink-0 rounded-full bg-status-available/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-status-available">
              Synced
            </span>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-flame-neon">
              local_fire_department
            </span>
            <h3 className="min-w-0 font-heading text-headline-sm leading-tight text-on-surface">
              Most played co-op &amp; battle arena
            </h3>
          </div>
          <span className="shrink-0 text-body-sm text-on-surface-variant">
            {visible.length} showing
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-obsidian-elevated px-4 py-10 text-center">
            <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
            <p className="font-heading text-headline-sm text-on-surface">No title matches that</p>
            <p className="max-w-xs text-body-sm text-on-surface-variant">
              Tell the counter what you want to play and we will pre-load it before your session.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {visible.map((game) => (
              <li
                key={game.title}
                className="rounded-xl border border-border-subtle bg-obsidian-elevated p-3 transition-colors hover:border-outline-variant"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-linear-to-br font-heading text-[14px] font-bold tracking-tight sm:h-16 sm:w-16 sm:text-[15px]",
                      game.accentClass
                    )}
                  >
                    {game.monogram.slice(0, 3)}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-frost-cyan">
                        {game.genre}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-status-available">
                        <span className="h-1 w-1 rounded-full bg-status-available" />
                        {game.installed ? "Installed" : "On request"}
                      </span>
                    </div>

                    <h4 className="font-heading text-headline-sm leading-tight text-on-surface">
                      {game.title}
                    </h4>

                    <div className="flex flex-wrap gap-1.5">
                      {game.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] leading-4 text-on-surface-variant"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-2.5 flex items-center gap-1.5 border-t border-border-subtle pt-2 text-[11px] leading-4 font-medium text-status-available">
                  <span className="material-symbols-outlined shrink-0 text-[14px]">cell_tower</span>
                  Ready on Station 1, Station 2, Station 3
                </p>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-4 flex items-start gap-3 rounded-xl border border-border-subtle bg-obsidian-elevated p-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-status-held">
            <span className="material-symbols-outlined text-[18px]">help</span>
          </span>
          <div className="flex flex-col gap-2">
            <div>
              <p className="flex flex-wrap items-center gap-1.5 font-heading text-label-action text-on-surface">
                Can&apos;t find your game?
                <span className="rounded bg-tertiary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-tertiary">
                  Free service
                </span>
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Request a pre-load before your session through the WhatsApp concierge and it will be
                ready on the rig when you arrive.
              </p>
            </div>
            <a
              className="flex w-fit items-center gap-1.5 rounded-lg border border-status-available/40 bg-status-available/10 px-3 py-1.5 text-label-badge uppercase tracking-wider text-status-available"
              href={whatsappLink("Hi Frost x Flame, can you pre-load a game for my session?")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              Request game on WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-obsidian-root/95 px-4 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.85)] backdrop-blur-xl md:px-10">
        <div className="mx-auto flex w-full max-w-app items-center gap-2 py-2.5">
          <Link
            aria-label="Back to floor map"
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-obsidian-elevated text-on-surface transition-all hover:text-frost-cyan active:scale-95"
            href="/customer/booking"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>
          <Link
            className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-flame-neon to-flame-amber font-heading text-label-action uppercase tracking-wider text-obsidian-root shadow-neon-flame transition-all hover:brightness-110 active:scale-[0.98]"
            href={pickHref}
          >
            <span className="material-symbols-outlined text-[18px]">sports_esports</span>
            {stationCode ? `Select ${stationCode} & pick slot` : "Pick a station & slot"}
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}

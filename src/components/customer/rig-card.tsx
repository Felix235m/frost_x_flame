import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Rig } from "@/lib/content/landing";

export function RigCard({ rig }: { rig: Rig }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/25 bg-obsidian-elevated transition-colors hover:border-outline-variant/50">
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <img
          alt={rig.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          src={rig.image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian-elevated via-obsidian-elevated/25 to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-obsidian-root/80 px-2.5 py-1 text-label-badge uppercase tracking-wider backdrop-blur-md">
          <span className={cn("h-1.5 w-1.5 rounded-full", rig.dotClass)} />
          <span className={rig.stationsColorClass}>{rig.stations}</span>
        </span>

        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-label-badge font-bold uppercase tracking-wider",
            rig.fromBadgeClass
          )}
        >
          {rig.fromLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-headline-md text-white">{rig.name}</h3>
          <ul className="flex flex-col gap-0.5 text-body-sm text-on-surface-variant">
            {rig.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {rig.games.map((game) => (
            <li
              key={game}
              className="rounded-md bg-surface-container-high px-2 py-1 text-body-sm text-on-surface/90"
            >
              {game}
            </li>
          ))}
        </ul>

        {/* Pinned to the bottom so every card's rate table and CTA line up across the grid. */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest/70">
            <div className="flex items-center justify-between px-3.5 py-2 text-label-badge uppercase tracking-wider text-outline">
              <span>Players</span>
              <span>Per hour</span>
            </div>
            <ul className="divide-y divide-outline-variant/15 border-t border-outline-variant/20">
              {rig.rates.map((rate) => (
                <li
                  key={rate.players}
                  className="flex items-center justify-between gap-3 px-3.5 py-2"
                >
                  <span className="text-body-sm text-on-surface-variant">{rate.players}</span>
                  <span className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "font-heading text-headline-sm font-bold tabular-nums",
                        rate.colorClass
                      )}
                    >
                      ₹{rate.price}
                    </span>
                    <span className="text-body-sm text-outline">/hr</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button asChild className="w-full" variant={rig.ctaVariant}>
            <Link href="/customer/booking">
              <span className="material-symbols-outlined text-[18px]">{rig.ctaIcon}</span>
              {rig.ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

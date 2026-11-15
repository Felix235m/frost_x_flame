import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/customer/layout";
import { RigCard } from "@/components/customer/rig-card";
import { SectionHeading } from "@/components/customer/section-heading";
import { CAFE, GUARANTEES, QUICK_FACTS, RIGS } from "@/lib/content/landing";

export default function LandingPage() {
  return (
    <CustomerLayout>
      {/* Announcement strip: edge to edge on phones, container width from md up */}
      <div className="-mx-4 border-y border-outline-variant/20 bg-surface-container-lowest md:mx-0">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 md:px-6">
          <span className="text-label-badge uppercase tracking-widest text-on-surface-variant">
            Play in ultra high definition
          </span>
          <span aria-hidden className="hidden h-1 w-1 rounded-full bg-outline-variant sm:block" />
          <span className="flex items-center gap-2 text-label-badge font-heading uppercase tracking-widest">
            <span className="text-frost-cyan">PS5</span>
            <span className="text-frost-sky">4K VR</span>
            <span className="text-flame-neon">Motion sim</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-28 -z-10 h-72 w-72 rounded-full bg-border-glow-frost opacity-50 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-28 -z-10 h-80 w-80 rounded-full bg-border-glow-flame opacity-40 blur-[120px]"
        />

        <div className="grid grid-cols-1 gap-8 pt-8 pb-2 md:pt-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <p className="flex w-fit items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high/80 px-3 py-1.5 text-label-badge uppercase tracking-wider text-tertiary-fixed backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-available" />
              </span>
              Instant booking, no login needed
            </p>

            <h1 className="max-w-[18ch] font-heading text-display-hero-mobile uppercase tracking-tight text-white md:max-w-[16ch] md:text-display-hero">
              Next-gen{" "}
              <span className="bg-linear-to-r from-frost-cyan to-frost-sky bg-clip-text text-transparent">
                console
              </span>{" "}
              &amp;{" "}
              <span className="bg-linear-to-r from-flame-neon to-flame-amber bg-clip-text text-transparent">
                sim gaming
              </span>{" "}
              cafe
            </h1>

            <p className="max-w-prose text-body-md text-on-surface-variant md:text-body-lg">
              3 PS5 rigs on 55-inch 4K OLED, a dual-headset VR arena and an Ultra-Force racing
              simulator with haptic telemetry.
            </p>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button asChild className="h-13 px-6">
                <Link href="/customer/booking">
                  <span className="material-symbols-outlined text-[20px]">sports_esports</span>
                  Book a slot now
                </Link>
              </Button>
              <Button asChild className="h-13 px-5" variant="outline">
                <Link href="#rigs">
                  Rigs and rates
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Fact panel: 3-up on phones, a labelled column on desktop */}
          <dl className="grid grid-cols-3 divide-x divide-outline-variant/25 overflow-hidden rounded-2xl border border-outline-variant/25 bg-obsidian-elevated/80 lg:col-span-5 lg:grid-cols-1 lg:divide-x-0 lg:divide-y lg:self-start">
            {QUICK_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col-reverse items-center gap-1 px-3 py-4 text-center lg:flex-row lg:items-baseline lg:justify-between lg:gap-4 lg:px-5 lg:py-5 lg:text-left"
              >
                <dt className="text-[11px] leading-tight tracking-wide text-on-surface-variant lg:text-body-sm">
                  {fact.label}
                </dt>
                <dd
                  className={`font-heading text-headline-md font-bold tabular-nums lg:text-headline-lg ${fact.colorClass}`}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Live floor strip */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-outline-variant/25 bg-obsidian-elevated px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-status-available">
              <span className="material-symbols-outlined text-[22px]">sensors</span>
            </span>
            <div className="flex flex-col">
              <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">
                Live cafe floor
              </span>
              <span className="font-heading text-headline-sm text-white">4 rigs open tonight</span>
            </div>
          </div>
          <span className="w-fit rounded-full bg-status-available/10 px-2.5 py-1 text-label-badge font-bold uppercase tracking-wider text-status-available">
            Realtime
          </span>
        </div>
      </section>

      {/* Rig lineup */}
      <section id="rigs" className="mt-10 scroll-mt-28 md:mt-14">
        <SectionHeading meta="3 battle zones" title="High-definition arsenal" />
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {RIGS.map((rig) => (
            <RigCard key={rig.id} rig={rig} />
          ))}
        </div>
      </section>

      {/* Cafe status + map */}
      <section className="mt-12 md:mt-16">
        <SectionHeading title="Live cafe status" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col divide-y divide-outline-variant/20 rounded-2xl border border-outline-variant/25 bg-obsidian-elevated lg:col-span-5">
            <div className="flex items-start gap-3.5 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-frost-sky">
                <span className="material-symbols-outlined text-[22px]">schedule</span>
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label-badge uppercase tracking-wider text-outline">
                  Operating hours
                </span>
                <span className="font-heading text-headline-sm text-white">{CAFE.hours} daily</span>
                <span className="flex items-center gap-1.5 text-body-sm text-status-available">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-available" />
                  {CAFE.openNote}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-flame-neon">
                <span className="material-symbols-outlined text-[22px]">pin_drop</span>
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label-badge uppercase tracking-wider text-outline">
                  Physical station
                </span>
                <span className="font-heading text-headline-sm text-white">{CAFE.address}</span>
                <span className="text-body-sm text-on-surface-variant">{CAFE.addressNote}</span>
              </div>
            </div>
          </div>

          <div className="relative isolate min-h-56 overflow-hidden rounded-2xl border border-outline-variant/25 lg:col-span-7 lg:min-h-0">
            <Link
              href={CAFE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
            >
              <img
                alt="Map showing the FrostxFlame cafe location in Manavalakurthi"
                className="absolute inset-0 -z-10 h-full w-full object-cover"
                loading="lazy"
                src={CAFE.mapImage}
              />
              <div className="absolute inset-0 -z-10 bg-linear-to-t from-obsidian-root/90 via-obsidian-root/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4">
                <span className="flex w-fit items-center gap-1.5 rounded-lg bg-obsidian-root/85 px-2.5 py-1 text-body-sm text-white backdrop-blur-sm">
                  <span
                    className="material-symbols-outlined text-[16px] text-flame-neon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                  FrostxFlame Hub
                </span>
                <span className="flex w-fit items-center gap-2 rounded-lg bg-surface-container-high px-3.5 py-2.5 text-label-action font-heading uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-highest hover:text-frost-cyan">
                  <span className="material-symbols-outlined text-[18px] text-frost-cyan">near_me</span>
                  Open in Google Maps
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="mt-12 md:mt-16">
        <SectionHeading title="Fair play and lounge rules" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GUARANTEES.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3.5 rounded-2xl border border-outline-variant/25 bg-obsidian-elevated p-4"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high ${item.iconColorClass}`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-headline-sm text-white">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clearance for the fixed action bar */}
      <div aria-hidden className="h-24 lg:h-20" />

      {/* Quick action bar, inset inside the container at every width */}
      <div className="fixed inset-x-0 bottom-20 z-40 lg:bottom-0">
        <div className="mx-auto w-full max-w-app px-4 md:px-10 lg:pb-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/30 bg-obsidian-elevated/95 px-4 py-3 shadow-cart backdrop-blur-xl md:gap-6">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-label-badge uppercase tracking-wider text-outline">
                Stations open
                <span className="h-1.5 w-1.5 rounded-full bg-status-available" />
              </span>
              <span className="flex items-baseline gap-1">
                <span className="text-body-sm text-on-surface-variant">From</span>
                <span className="font-heading text-headline-md text-frost-cyan tabular-nums">
                  ₹150
                </span>
                <span className="text-body-sm text-outline">/hr</span>
              </span>
            </div>
            <Button asChild className="flex-1 sm:flex-none sm:px-8">
              <Link href="/customer/booking">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  gamepad
                </span>
                Reserve station
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

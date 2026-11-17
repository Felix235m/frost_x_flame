/**
 * Station, pricing and time-slot content for the booking flow.
 * Plain data + pure helpers so both server and client components can import it.
 */

export type StationType = "ps5" | "vr" | "sim";

export interface PlayerTier {
  players: number;
  label: string;
  ratePerHour: number;
  note: string;
  icon: string;
  popular?: boolean;
}

export interface StationSpec {
  icon: string;
  label: string;
  note: string;
  colorClass: string;
}

export interface Station {
  id: string;
  code: string;
  type: StationType;
  typeLabel: string;
  rig: string;
  screen: string;
  /** Group rate for the popular tier — used where a party size is already picked. */
  ratePerHour: number;
  /** Lowest tier, one person alone. This is the rate the floor plan advertises. */
  soloRatePerHour: number;
  defaultPlayers: number;
  /** Highest headcount tier the rig supports. */
  maxPlayers: number;
  zone: string;
  image: string;
  imageAlt: string;
  flagship?: boolean;
  specs: StationSpec[];
}

export const PLAYER_TIERS: Record<StationType, PlayerTier[]> = {
  ps5: [
    { players: 1, label: "Solo", ratePerHour: 150, note: "1 Controller • Focused Rig", icon: "person" },
    { players: 2, label: "Duo", ratePerHour: 250, note: "2 Controllers • Co-op / Versus", icon: "group", popular: true },
    { players: 3, label: "Trio", ratePerHour: 300, note: "3 Controllers • Triple Action", icon: "groups" },
    { players: 4, label: "Squad", ratePerHour: 400, note: "4 Controllers • Tournament Rig", icon: "sports_esports" },
  ],
  vr: [
    { players: 1, label: "Solo", ratePerHour: 300, note: "1 Headset • Omni rig", icon: "person" },
    { players: 2, label: "Co-op", ratePerHour: 550, note: "2 Headsets • Shared arena", icon: "group", popular: true },
  ],
  sim: [
    { players: 1, label: "Solo", ratePerHour: 350, note: "1 Driver • Force feedback", icon: "person", popular: true },
    { players: 2, label: "Co-pilot", ratePerHour: 600, note: "2 Seats • Passenger relay", icon: "group" },
  ],
};

export function defaultTierFor(type: StationType): PlayerTier {
  return PLAYER_TIERS[type].find((t) => t.popular) ?? PLAYER_TIERS[type][0];
}

export function getTier(type: StationType, players: number): PlayerTier {
  return PLAYER_TIERS[type].find((t) => t.players === players) ?? PLAYER_TIERS[type][0];
}

/** The one-person tier: the single-player rate, and the floor's advertised price. */
export function soloTierFor(type: StationType): PlayerTier {
  return PLAYER_TIERS[type].reduce((lowest, tier) =>
    tier.players < lowest.players ? tier : lowest
  );
}

export function maxPlayersFor(type: StationType): number {
  return PLAYER_TIERS[type].reduce((most, tier) => Math.max(most, tier.players), 1);
}

const PS5_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClmPX8MXkAAoe3DTbK9Q2m1ZhScxXjz0gThsPxRrof-bgSBapY3z04pwcE_rVrNAKYAzqz9A8-PPPiwdcycE7TZxof0U6DvBb9tzSH8LoY-ucsIGJba3dhX0mvxMQGfgTGHtLZMxI8LS92l1YZpBBSp9cf3thhBvYJvpx3LFRfZhMa6izvw-5g3Rhr88PKEZE8gDO2mhc_FEl-bl-_V44uaQAAu4Com_5-TZQ7qjo";

const VR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9UaeXwJ15F-BfYbg6T1gXXXCE6syhUeoncLpsFf3n_d-Ie9FmpjLQ1afi9xnxxyuL3i1RZzEffoCzgmUROByuOxasXewQO_DhW5Gr4uLE-5XX8VqgdMfVGCwqspmruB0biaERGjuG2p4UqobjbjC16QdyHsGRx3wBM0wkViC0d7nr9zxu6kxX5GRPL58yAj9M-KljMTASPEZJUR2PreGorFnqeIOIDuJR6zFRNxk";

const SIM_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuASbGgvo5Ux0CPs0ClDu25m29ax3f70LgvmYloqBteo7Q-I6LepRIOOuOPPk4gNue8D6Mr-QU614jEQVnokRlw3oErcBWopEfpl8rJVFUW1Upqe4Uy-h0A2Y15rIe5KepB7AMGV8WfmYm_faymj0t5caJpc7iqz-6SvAP5UY-Ue5v-6gbNsoYVyDsFGBXpuzPZjGcVx_BDiJ7eOoifVZmTKMq8Ms6jN9NUfg2YtZBA";

const PS5_SPECS: StationSpec[] = [
  { icon: "tv", label: '65" 4K OLED 120Hz', note: "Spectral Super Res", colorClass: "text-frost-sky" },
  { icon: "sports_esports", label: "4x DualSense Edge", note: "Haptic feedback", colorClass: "text-flame-amber" },
  { icon: "headphones", label: "Pulse Elite Planar", note: "Spatial 3D audio", colorClass: "text-tertiary-fixed" },
  { icon: "bolt", label: "PS5 Pro GPU 2TB", note: "Advanced ray tracing", colorClass: "text-secondary" },
];

const VR_SPECS: StationSpec[] = [
  { icon: "view_in_ar", label: "Omni motion mat", note: "Room-scale tracking", colorClass: "text-frost-cyan" },
  { icon: "headphones", label: "Dual headset rigs", note: "Spatial audio", colorClass: "text-tertiary-fixed" },
  { icon: "surround_sound", label: "Boundary grid", note: "Guardian safety", colorClass: "text-frost-sky" },
  { icon: "bolt", label: "Wired streaming", note: "Zero wireless drop", colorClass: "text-flame-amber" },
];

const SIM_SPECS: StationSpec[] = [
  { icon: "speed", label: "Fanatec DD Pro", note: "Direct drive wheel", colorClass: "text-flame-neon" },
  { icon: "tune", label: "Load-cell pedals", note: "Brake pressure", colorClass: "text-frost-sky" },
  { icon: "airline_seat_recline_extra", label: "Sparco bucket", note: "Rigid cockpit", colorClass: "text-secondary" },
  { icon: "screenshot_monitor", label: "Triple 1440p", note: "Curved wrap view", colorClass: "text-tertiary-fixed" },
];

interface StationSeed {
  id: string;
  code: string;
  type: StationType;
  zone: string;
  flagship?: boolean;
}

const SEEDS: StationSeed[] = [
  { id: "ps1", code: "Station 1", type: "ps5", zone: "Stage North", flagship: true },
  { id: "ps2", code: "Station 2", type: "ps5", zone: "Stage North" },
  { id: "ps3", code: "Station 3", type: "ps5", zone: "Stage North" },
  { id: "vr1", code: "VR 1", type: "vr", zone: "VR Zone Arena" },
  { id: "vr2", code: "VR 2", type: "vr", zone: "VR Zone Arena" },
  { id: "sim", code: "Racing Sim", type: "sim", zone: "Sim Bay" },
];

const TYPE_META: Record<StationType, { label: string; rig: string; screen: string; image: string; alt: string; specs: StationSpec[] }> = {
  ps5: {
    label: "PlayStation 5 Pro",
    rig: "PlayStation 5 Pro",
    screen: 'OLED 65"',
    image: PS5_IMAGE,
    alt: "PlayStation 5 Pro station with a 65-inch OLED display and DualSense controller",
    specs: PS5_SPECS,
  },
  vr: {
    label: "VR Arena",
    rig: "Omni Rig",
    screen: "Omni Rig",
    image: VR_IMAGE,
    alt: "VR arena pod with omni motion mat and headset",
    specs: VR_SPECS,
  },
  sim: {
    label: "Racing Simulator",
    rig: "Ultra Force Motion Rig",
    screen: "Fanatec Rig",
    image: SIM_IMAGE,
    alt: "Direct-drive racing cockpit with bucket seat and triple curved display",
    specs: SIM_SPECS,
  },
};

export const STATIONS: Station[] = SEEDS.map((seed) => {
  const meta = TYPE_META[seed.type];
  const tier = defaultTierFor(seed.type);
  return {
    id: seed.id,
    code: seed.code,
    type: seed.type,
    typeLabel: meta.label,
    rig: meta.rig,
    screen: meta.screen,
    ratePerHour: tier.ratePerHour,
    soloRatePerHour: soloTierFor(seed.type).ratePerHour,
    defaultPlayers: tier.players,
    maxPlayers: maxPlayersFor(seed.type),
    zone: seed.zone,
    image: meta.image,
    imageAlt: meta.alt,
    flagship: seed.flagship,
    specs: meta.specs,
  };
});

export const PS5_ROW = STATIONS.filter((s) => s.type === "ps5");
export const VR_PODS = STATIONS.filter((s) => s.type === "vr");
export const SIM_RIG = STATIONS.find((s) => s.type === "sim")!;

export function getStation(id: string | undefined): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}

export function stationsForType(type: StationType): Station[] {
  return STATIONS.filter((s) => s.type === type);
}

/** Cafe opens 10 AM and closes 1 AM, so the last bookable hour starts at midnight. */
export const OPENING_HOUR = 10;
export const LAST_START_HOUR = 24;
export const TIME_SLOTS: number[] = Array.from(
  { length: LAST_START_HOUR - OPENING_HOUR + 1 },
  (_, i) => OPENING_HOUR + i
);

function normaliseHour(hour: number): number {
  return ((hour - 1) % 24) + 1;
}

export function hourLabel(hour: number): string {
  const h = normaliseHour(hour);
  if (h === 12) return "12 PM";
  if (h === 24) return "12 AM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

export function hourLabelLong(hour: number): string {
  const h = normaliseHour(hour);
  if (h === 12) return "12:00 PM";
  if (h === 24) return "12:00 AM";
  return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
}

export function slotValue(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

export function rangeLabel(startHour: number, hours: number): string {
  return `${hourLabelLong(startHour)} – ${hourLabelLong(startHour + hours)}`;
}

export interface DayOption {
  value: string;
  weekday: string;
  date: string;
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The cafe runs on IST; the server may be in UTC, so normalise before deriving a date. */
const IST_OFFSET_MINUTES = 330;

/**
 * Today's date at the cafe. This reads the clock, so it may only be called from
 * inside a dynamic segment (after `await connection()`), never during prerendering.
 */
export function todayIso(): string {
  const now = new Date();
  const istWallClock = new Date(
    now.getTime() + (IST_OFFSET_MINUTES + now.getTimezoneOffset()) * 60_000
  );
  return isoDate(istWallClock);
}

export function daysAhead(count = 4, fromIso: string = todayIso()): DayOption[] {
  const base = new Date(`${fromIso}T00:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    const weekday =
      index === 0
        ? "Today"
        : index === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-IN", { weekday: "short" });
    return {
      value: isoDate(date),
      weekday,
      date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  });
}

export function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

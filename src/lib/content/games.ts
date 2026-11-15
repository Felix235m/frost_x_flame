/**
 * Installed PlayStation library shown on /customer/booking/games.
 * Cover art is represented by a monogram tile rather than stock imagery, so the
 * list stays consistent inside the frosted dark palette.
 */

export interface Game {
  title: string;
  genre: string;
  badges: string[];
  tags: ("coop" | "solo" | "racing" | "fighting" | "sports")[];
  installed: boolean;
  /** Monogram + accent colour for the cover tile. */
  monogram: string;
  accentClass: string;
}

export const GAMES: Game[] = [
  {
    title: "EA Sports FC 24",
    genre: "Sports Football",
    badges: ["4 Player Local", "DualSense Haptics"],
    tags: ["coop", "sports"],
    installed: true,
    monogram: "FC",
    accentClass: "from-frost-cyan/30 to-frost-sky/10 text-frost-cyan",
  },
  {
    title: "Tekken 8",
    genre: "Fighting Arena",
    badges: ["2 Player Versus", "Tournament Legal"],
    tags: ["fighting", "coop"],
    installed: true,
    monogram: "T8",
    accentClass: "from-flame-neon/30 to-flame-amber/10 text-flame-neon",
  },
  {
    title: "It Takes Two",
    genre: "Co-op Adventure",
    badges: ["2 Player Split-Screen", "Co-op Only"],
    tags: ["coop"],
    installed: true,
    monogram: "IT",
    accentClass: "from-tertiary-fixed/30 to-tertiary/10 text-tertiary-fixed",
  },
  {
    title: "Helldivers 2",
    genre: "Squad Shooter",
    badges: ["4 Player Squads", "Friendly Fire On"],
    tags: ["coop"],
    installed: true,
    monogram: "HD",
    accentClass: "from-status-held/30 to-flame-amber/10 text-status-held",
  },
  {
    title: "Mortal Kombat 1",
    genre: "Fighting Versus",
    badges: ["2 Player Versus", "Bloodless Mode"],
    tags: ["fighting", "coop"],
    installed: true,
    monogram: "MK",
    accentClass: "from-status-booked/30 to-flame-neon/10 text-status-booked",
  },
  {
    title: "NBA 2K24 Kobe Edition",
    genre: "Sports Basketball",
    badges: ["2 Player Local", "MyCAREER"],
    tags: ["coop", "sports"],
    installed: true,
    monogram: "2K",
    accentClass: "from-flame-amber/30 to-status-held/10 text-flame-amber",
  },
  {
    title: "Gran Turismo 7",
    genre: "Racing Simulator",
    badges: ["2 Player Split-Screen", "Wheel Ready"],
    tags: ["racing", "coop"],
    installed: true,
    monogram: "GT",
    accentClass: "from-frost-sky/30 to-frost-cyan/10 text-frost-sky",
  },
  {
    title: "Marvel's Spider-Man 2",
    genre: "Action Open World",
    badges: ["Single Player", "Save Slot Ready"],
    tags: ["solo"],
    installed: true,
    monogram: "SM",
    accentClass: "from-flame-neon/30 to-flame-neon/5 text-flame-neon",
  },
  {
    title: "WRC 24",
    genre: "Racing Rally",
    badges: ["2 Player Local", "Wheel Ready"],
    tags: ["racing", "coop"],
    installed: true,
    monogram: "WRC",
    accentClass: "from-tertiary-fixed/30 to-frost-cyan/10 text-tertiary-fixed",
  },
  {
    title: "God of War Ragnarök",
    genre: "Action Mythic",
    badges: ["Single Player", "Save Slot Ready"],
    tags: ["solo"],
    installed: true,
    monogram: "GoW",
    accentClass: "from-secondary/30 to-flame-amber/10 text-secondary",
  },
  {
    title: "F1 24",
    genre: "Racing Formula",
    badges: ["2 Player Split-Screen", "Cockpit Ready"],
    tags: ["racing", "coop"],
    installed: true,
    monogram: "F1",
    accentClass: "from-flame-neon/30 to-status-held/10 text-flame-neon",
  },
  {
    title: "Call of Duty: Warzone",
    genre: "FPS Battle Royale",
    badges: ["Online Squad Party", "3D Spatial Tuned"],
    tags: ["coop"],
    installed: true,
    monogram: "COD",
    accentClass: "from-on-surface-variant/30 to-frost-sky/10 text-on-surface-variant",
  },
];

export const GAME_FILTERS = [
  { id: "all", label: "All titles" },
  { id: "coop", label: "Co-op / Multiplayer" },
  { id: "solo", label: "Single player" },
  { id: "racing", label: "Racing" },
  { id: "fighting", label: "Fighting" },
] as const;

export type GameFilterId = (typeof GAME_FILTERS)[number]["id"];

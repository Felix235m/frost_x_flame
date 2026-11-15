/**
 * Static marketing content for the customer landing page.
 * Kept out of the component so the page stays a layout declaration.
 */

export interface RateRow {
  players: string;
  price: number;
  /** Colour token for the price value, so scanning a column stays consistent. */
  colorClass: string;
}

export interface Rig {
  id: "ps5" | "vr" | "sim";
  name: string;
  specs: string[];
  stations: string;
  stationsColorClass: string;
  dotClass: string;
  fromLabel: string;
  fromBadgeClass: string;
  games: string[];
  rates: RateRow[];
  ctaLabel: string;
  ctaIcon: string;
  ctaVariant: "secondary" | "flame";
  image: string;
  imageAlt: string;
}

export const QUICK_FACTS = [
  { value: "4K", label: "120Hz displays", colorClass: "text-frost-cyan" },
  { value: "0ms", label: "Direct-drive sim", colorClass: "text-frost-sky" },
  { value: "₹150", label: "Starting per hour", colorClass: "text-flame-neon" },
];

export const RIGS: Rig[] = [
  {
    id: "ps5",
    name: "Sony PlayStation 5 Rigs",
    specs: ["55-inch 4K 120Hz OLED", "DualSense haptics"],
    stations: "PS 1, PS 2, PS 3",
    stationsColorClass: "text-frost-cyan",
    dotClass: "bg-status-available",
    fromLabel: "From ₹150/hr",
    fromBadgeClass: "bg-frost-cyan text-obsidian-root",
    games: ["FIFA 24", "Spider-Man 2", "Tekken 8", "Mortal Kombat 1"],
    rates: [
      { players: "1 player", price: 150, colorClass: "text-frost-cyan" },
      { players: "2 players", price: 250, colorClass: "text-white" },
      { players: "3 players", price: 300, colorClass: "text-white" },
      { players: "4 players", price: 400, colorClass: "text-white" },
    ],
    ctaLabel: "Select PS5 rig",
    ctaIcon: "calendar_clock",
    ctaVariant: "secondary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0yIm9yAXk5FxxoQrwJTFmAI2urBfnfJXEyFWzycciUhX5nMHmHZrnqWM0x1WUtEJR-E024S4AWibISGx5FrD4G0LPABS1K4dUIkuwtySi50tTP3_uD5Unyw_VdgfCLGTlFiDqnOYFv1L7gsaW5cw2LFBL5MGZTkQv9b0ZDaRnRnyBgquVfJ_G21a6pxrch7VWsgYH3GpHiPaAmflZ0KufgI_tXO6iXQ_YC0SZNqk",
    imageAlt: "PlayStation 5 consoles on a dark desk with 4K OLED displays in the cafe",
  },
  {
    id: "vr",
    name: "VR Dual Arena",
    specs: ["Room-scale motion tracking", "360° spatial audio", "Dual VR battling"],
    stations: "VR 1, VR 2",
    stationsColorClass: "text-frost-sky",
    dotClass: "bg-status-available",
    fromLabel: "From ₹300/hr",
    fromBadgeClass: "bg-tertiary-container text-on-tertiary-container",
    games: ["Beat Saber", "Superhot VR", "Gran Turismo VR"],
    rates: [
      { players: "Solo", price: 300, colorClass: "text-frost-sky" },
      { players: "Co-op, 2 headsets", price: 550, colorClass: "text-white" },
    ],
    ctaLabel: "Select VR arena",
    ctaIcon: "view_in_ar",
    ctaVariant: "secondary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9UaeXwJ15F-BfYbg6T1gXXXCE6syhUeoncLpsFf3n_d-Ie9FmpjLQ1afi9xnxxyuL3i1RZzEffoCzgmUROByuOxasXewQO_DhW5Gr4uLE-5XX8VqgdMfVGCwqspmruB0biaERGjuG2p4UqobjbjC16QdyHsGRx3wBM0wkViC0d7nr9zxu6kxX5GRPL58yAj9M-KljMTASPEZJUR2PreGorFnqeIOIDuJR6zFRNxk",
    imageAlt: "Player in a VR headset inside a neon-lit arena zone",
  },
  {
    id: "sim",
    name: "Racing Simulator Cockpit",
    specs: ["Fanatec direct drive", "Load-cell braking", "Triple curved display"],
    stations: "Pro Sim 1",
    stationsColorClass: "text-flame-neon",
    dotClass: "bg-status-held",
    fromLabel: "₹350/hr",
    fromBadgeClass: "bg-flame-neon text-obsidian-root",
    games: ["F1 24", "Forza Horizon 5", "Assetto Corsa"],
    rates: [
      { players: "Solo", price: 350, colorClass: "text-flame-neon" },
      { players: "Co-pilot seat", price: 600, colorClass: "text-white" },
    ],
    ctaLabel: "Select sim cockpit",
    ctaIcon: "speed",
    ctaVariant: "flame",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASbGgvo5Ux0CPs0ClDu25m29ax3f70LgvmYloqBteo7Q-I6LepRIOOuOPPk4gNue8D6Mr-QU614jEQVnokRlw3oErcBWopEfpl8rJVFUW1Upqe4Uy-h0A2Y15rIe5KepB7AMGV8WfmYm_faymj0t5caJpc7iqz-6SvAP5UY-Ue5v-6gbNsoYVyDsFGBXpuzPZjGcVx_BDiJ7eOoifVZmTKMq8Ms6jN9NUfg2YtZBA",
    imageAlt: "Direct-drive steering wheel and bucket seat in the racing simulator cockpit",
  },
];

export const GUARANTEES = [
  {
    title: "100% refund policy",
    body: "Cancel up to 2 hours before your slot for a full refund to the original UPI account.",
    icon: "currency_exchange",
    iconColorClass: "text-status-available",
  },
  {
    title: "Instant UPI, WhatsApp ticket",
    body: "No login or account creation. Your passcode is sent straight to WhatsApp after payment.",
    icon: "qr_code_scanner",
    iconColorClass: "text-frost-cyan",
  },
  {
    title: "Sanitised and air-conditioned",
    body: "Gear is wiped down between sessions, with drinks and snacks served at the lounge.",
    icon: "ac_unit",
    iconColorClass: "text-flame-neon",
  },
];

export const CAFE = {
  hours: "10:00 AM – 1:00 AM",
  openNote: "Open now, late-night sessions active",
  address: "FrostxFlame, 48W4+WXF",
  addressNote: "Manavalakurthi, Tamil Nadu 629252",
  mapsUrl: "https://maps.app.goo.gl/pGqHxNM87A3endjA8",
  mapImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA8rOSrzdEeVfXo7MfHiz2yW2RMKy0o2iY-lC1xLP-QrDLt3_UH8W3bV8C-pLVQPiBRta8ZyMjDo9axRij-MywNM_LJQq-3ceh0snoXo-Iy71MSzzjjEzLGw5DpNaW8zx72a6vC4TF1mSgXNa_NEAJ788KgYvgRlzJ5WcZnV-4N_Pawcu-4duD5wf627Uy5h25hamIcja0UvgikypUWFdhC0OhQvX36XVreX7SD76I",
};

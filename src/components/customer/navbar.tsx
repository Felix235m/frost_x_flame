"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOGO_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1KfUlAEZ2KouPAYZUE9xiGFw72XhI5777kQ9ZGkhZ9kU8yCGFS68D3O9Y9YOvyAUlqgtGzWapyDVfXOvRa3lRSfkAWgT-Qjj4oBViPGQZf_StxKsibmjMr5zhk8XB5WCiiatZaM-pNZh5AgRmSJ3x4CxrN9XOWjLtk8E5Yiym7FwBCcmf6JHZm05-jrqpc29bCT-U6d8pBrqqNZU53b1r6NdIvDQOk0us1HGACE";

const navItems = [
  { href: "/customer", icon: "sports_esports", label: "Arena" },
  { href: "/customer/manage", icon: "confirmation_number", label: "Booking" },
  { href: "/customer/refund-policy", icon: "policy", label: "Refunds" },
  { href: "/customer/support", icon: "chat", label: "Support" },
];

function isActiveRoute(pathname: string, href: string) {
  return href === "/customer" ? pathname === href : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="pt-safe fixed inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-obsidian-root/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-app items-center justify-between gap-4 px-4 md:px-10">
        <Link href="/customer" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm">
            <img alt="Frost x Flame logo" className="h-full w-full object-cover" src={LOGO_SRC} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 font-heading text-[15px] font-bold uppercase tracking-[0.12em] sm:text-headline-sm sm:tracking-wider">
              <span className="text-frost-cyan">Frost</span>
              <span className="text-flame-neon" aria-hidden>
                ✕
              </span>
              <span className="text-flame-neon">Flame</span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-label-badge uppercase tracking-wider text-on-surface-variant">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-available shadow-[0_0_8px_#10B981]" />
              <span className="truncate">Open till 1 AM, live floor</span>
            </span>
          </span>
        </Link>

        <nav aria-label="Customer sections" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-label-action font-heading uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-surface-container-high text-frost-cyan"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/customer/support"
          aria-label="Help and support"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant transition-colors hover:border-frost-cyan/50 hover:text-frost-cyan"
        >
          <span className="material-symbols-outlined text-[20px]">support_agent</span>
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Customer sections"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/25 bg-obsidian-root/90 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-20 max-w-lg items-center justify-around gap-1 px-2">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-14 min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                active ? "text-frost-cyan" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="w-full truncate text-center text-[10px] font-heading leading-none uppercase tracking-normal">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

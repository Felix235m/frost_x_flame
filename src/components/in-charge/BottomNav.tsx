"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/in-charge/floor", label: "Arena", icon: "dashboard" },
  { href: "/in-charge/bookings", label: "Bookings", icon: "event" },
  { href: "/in-charge/walk-in", label: "Quick Book", icon: "add_circle" },
  { href: "/in-charge/cancelled", label: "Audit", icon: "receipt" },
];

export function BottomNav({ session }: { session: { role: string } }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/20 bg-obsidian-root/90 backdrop-blur-md px-3 py-2">
      <div className="flex justify-around gap-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-colors",
                isActive
                  ? "bg-frost-cyan/10 text-frost-cyan border border-frost-cyan/30"
                  : "text-on-surface-variant hover:text-frost-cyan hover:bg-surface-container"
              )}
              href={tab.href}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className={`text-[10px] font-heading uppercase tracking-wider ${isActive ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

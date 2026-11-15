"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AdminAuthProvider,
  type StaffSession,
} from "@/components/admin/auth-context";
import { BRAND_LOGO } from "@/lib/content/brand";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Smartphone,
  Users,
  X,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Live Floor", group: "all" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications", group: "all" },
  { href: "/admin/bookings", icon: Calendar, label: "Bookings", group: "all" },
  { href: "/admin/new-booking", icon: Smartphone, label: "New Booking", group: "all" },
  { href: "/admin/refunds", icon: CreditCard, label: "Refunds", group: "all" },
  { href: "/admin/devices", icon: Building2, label: "Devices", group: "all" },
  { href: "/admin/pricing", icon: BarChart3, label: "Pricing", group: "owner" },
  { href: "/admin/customers", icon: Users, label: "Customers", group: "all" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports", group: "owner" },
  { href: "/admin/staff", icon: ShieldAlert, label: "Staff", group: "owner" },
  { href: "/admin/settings", icon: FileText, label: "Settings", group: "owner" },
  { href: "/admin/audit", icon: FileText, label: "Audit Log", group: "owner" },
];

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  /*
   * Every hook runs before any early return. Previously `usePathname` and the
   * sidebar state sat below the login gate, which broke the hook order the
   * moment a PIN succeeded.
   */
  const pathname = usePathname();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSession(data.session as StaffSession);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setSidebarOpen(false);
  }, []);

  const isOwner = () => session?.role === "owner";

  if (!session) {
    return <PinLogin isLoading={isLoading} login={login} />;
  }

  const navItems = ADMIN_NAV.filter((item) => item.group === "all" || item.group === session.role);

  return (
    <AdminAuthProvider value={{ session, login, logout, isOwner, isLoading }}>
      <div className="flex h-dvh overflow-hidden bg-obsidian-root text-on-surface">
        {sidebarOpen ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-outline-variant/20 bg-obsidian-elevated transition-transform duration-300 md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-space-md pt-space-md md:hidden">
            <span className="font-heading text-label-action uppercase tracking-wider text-on-surface-variant">
              Navigation
            </span>
            <button
              aria-label="Close navigation"
              className="rounded-lg p-1.5 text-on-surface-variant hover:text-frost-cyan"
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md">
            <Link className="mb-space-lg flex items-center gap-space-sm" href="/admin">
              <img alt="Frost x Flame" className="h-8 w-auto object-contain" src={BRAND_LOGO} />
              <span className="font-heading text-headline-sm tracking-tight text-on-surface">
                Frost x Flame
              </span>
            </Link>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-r-2 px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-frost-cyan bg-frost-cyan/10 text-frost-cyan"
                        : "border-transparent text-on-surface-variant hover:bg-surface-container hover:text-frost-cyan"
                    )}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="text-body-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-outline-variant/20 p-space-md">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-frost-cyan/20 text-frost-cyan">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-body-sm font-semibold text-on-surface">
                  {session.name}
                </span>
                <span className="text-label-badge uppercase tracking-wider text-on-surface-variant">
                  {session.role}
                </span>
              </div>
            </div>
            <button
              className="flex w-full items-center gap-2 rounded-lg bg-surface-container px-3 py-2 text-on-surface transition-colors hover:bg-surface-container-high"
              onClick={logout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-body-sm">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-outline-variant/20 bg-obsidian-root/80 px-space-md backdrop-blur-md md:px-space-lg">
            <div className="flex items-center gap-2">
              <button
                aria-label="Open navigation"
                className="rounded-lg p-2 text-on-surface-variant hover:text-frost-cyan md:hidden"
                onClick={() => setSidebarOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <span className="font-heading text-label-action uppercase tracking-wider text-on-surface-variant md:hidden">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5">
              <span className="h-2 w-2 animate-ping rounded-full bg-status-available" />
              <span className="text-body-sm text-on-surface-variant">System Live</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-space-md md:p-space-lg">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}

function PinLogin({
  login,
  isLoading,
}: {
  login: (pin: string) => Promise<boolean>;
  isLoading: boolean;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const press = (digit: string) => {
    setError("");
    setPin((current) => (current.length < 6 ? current + digit : current));
  };

  const backspace = () => {
    setError("");
    setPin((current) => current.slice(0, -1));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pin.length < 6) return;
    const ok = await login(pin);
    if (!ok) {
      setError("That PIN was not recognised. Try again.");
      setPin("");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-obsidian-root px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img alt="Frost x Flame" className="h-12 w-auto object-contain" src={BRAND_LOGO} />
          <h1 className="font-heading text-headline-md font-bold text-on-surface">Staff sign in</h1>
          <p className="text-body-sm text-on-surface-variant">
            Enter your 6-digit shift PIN to open the console.
          </p>
        </div>

        <form
          className="rounded-2xl border border-border-subtle bg-obsidian-elevated p-4 shadow-glow-frost"
          onSubmit={handleSubmit}
        >
          <label
            className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant"
            htmlFor="staff-pin"
          >
            Shift PIN
          </label>
          <input
            autoComplete="off"
            autoFocus
            className={cn(
              "h-14 w-full rounded-xl border bg-obsidian-root pl-[0.5em] text-center font-heading text-label-timer tracking-[0.5em] text-on-surface placeholder:tracking-normal placeholder:text-outline focus:outline-hidden",
              error
                ? "border-status-booked/60"
                : "border-border-subtle focus:border-frost-cyan/60"
            )}
            id="staff-pin"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => {
              setError("");
              setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
            }}
            pattern="\d*"
            placeholder="••••••"
            type="password"
            value={pin}
          />

          {error ? (
            <p
              className="mt-2 rounded-lg border border-status-booked/30 bg-status-booked/10 px-3 py-2 text-body-sm text-status-booked"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <KeypadKey key={digit} onClick={() => press(digit)}>
                {digit}
              </KeypadKey>
            ))}
            <KeypadKey muted onClick={backspace}>
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </KeypadKey>
            <KeypadKey onClick={() => press("0")}>0</KeypadKey>
            <button
              className="flex h-12 items-center justify-center rounded-lg bg-frost-cyan font-heading text-label-action uppercase text-obsidian-root shadow-neon-frost transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
              disabled={pin.length < 6 || isLoading}
              type="submit"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              ) : (
                "Enter"
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-body-sm text-on-surface-variant">
          PINs are issued by the owner under Settings &rarr; Staff.
        </p>
        <Link
          className="mt-3 flex items-center justify-center gap-1 text-label-badge uppercase tracking-wider text-outline transition-colors hover:text-frost-cyan"
          href="/customer"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Back to booking site
        </Link>
      </div>
    </div>
  );
}

function KeypadKey({
  children,
  onClick,
  muted = false,
}: {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-12 items-center justify-center rounded-lg bg-surface-container font-heading text-headline-sm text-on-surface transition-colors hover:bg-surface-container-high active:scale-95",
        muted && "text-on-surface-variant"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

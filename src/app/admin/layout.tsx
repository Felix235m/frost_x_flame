"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/components/admin/auth-context";
import { LogOut, Calendar, BarChart3, Users, ShieldAlert, CreditCard, Building2, LayoutDashboard, FileText, Smartphone, Bell } from "lucide-react";

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

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setSession(data.session);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const isOwner = () => session?.role === "owner";

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-obsidian-root">
        <div className="w-full max-w-md p-6">
          <PinLoginForm login={login} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AdminAuthProvider value={{ session, login, logout, isOwner, isLoading }}>
      <div className="flex h-screen bg-obsidian-root text-on-surface">
        <aside className="w-64 bg-obsidian-elevated border-r border-outline-variant/20 transition-all duration-300">
          <div className="p-space-md">
            <Link href="/admin" className="flex items-center gap-space-sm mb-space-lg">
              <img
                alt="Frost x Flame Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1KfUlAEZ2KouPAYZUE9xiGFw72XhI5777kQ9ZGkhZ9kU8yCGFS68D3O9Y9YOvyAUlqgtGzWapyDVfXOvRa3lRSfkAWgT-Qjj4oBViPGQZf_StxKsibmjMr5zhk8XB5WCiiatZaM-pNZh5AgRmSJ3x4CxrN9XOWjLtk8E5Yiym7FwBCcmf6JHZm05-jrqpc29bCT-U6d8pBrqqNZU53b1r6NdIvDQOk0us1HGACE"
              />
              <span className="font-heading text-headline-sm text-on-surface tracking-tight">Frost x Flame</span>
            </Link>
            <nav className="space-y-0.5">
              {ADMIN_NAV.filter((n) => n.group === "all" || n.group === session.role).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-frost-cyan/10 text-frost-cyan border-r-2 border-frost-cyan"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-frost-cyan"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="font-body-md text-body-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-space-md border-t border-outline-variant/20 mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-frost-cyan/20 flex items-center justify-center text-frost-cyan">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">{session.name}</span>
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">{session.role}</span>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="font-body-sm text-body-sm">Logout</span>
            </button>
          </div>
        </aside>
        <div className="flex-1 overflow-hidden flex flex-col">
          <header className="h-16 border-b border-outline-variant/20 bg-obsidian-root/80 backdrop-blur-md flex items-center justify-between px-space-lg">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden p-2 text-on-surface-variant hover:text-frost-cyan"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-status-available animate-ping"></span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">System Live</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-space-lg">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}

function PinLoginForm({ login, isLoading }: { login: (pin: string) => Promise<boolean>; isLoading: boolean }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const digits = pin.split("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(pin);
    if (!ok) {
      setError("Invalid PIN. Try again.");
      setPin("");
    }
  };

  return (
    <div className="mx-auto">
      <img
        alt="Frost x Flame Logo"
        className="mx-auto h-10 w-auto mb-6 object-contain"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1KfUlAEZ2KouPAYZUE9xiGFw72XhI5777kQ9ZGkhZ9kU8yCGFS68D3O9Y9YOvyAUlqgtGzWapyDVfXOvRa3lRSfkAWgT-Qjj4oBViPGQZf_StxKsibmjMr5zhk8XB5WCiiatZaM-pNZh5AgRmSJ3x4CxrN9XOWjLtk8E5Yiym7FwBCcmf6JHZm05-jrqpc29bCT-U6d8pBrqqNZU53b1r6NdIvDQOk0us1HGACE"
      />
      <h2 className="font-heading text-headline-md text-on-surface font-bold text-center mb-2">Who's on Shift</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">Enter your staff PIN to start your shift</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                digits[i - 1] ? "bg-frost-cyan text-obsidian-root shadow-[0_0_20px_rgba(0,229,255,0.4)]" : "bg-surface-container border border-outline-variant/30"
              }`}
            >
              {digits[i - 1] || <span className="text-outline-variant">·</span>}
            </div>
          ))}
        </div>
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="sr-only"
          autoFocus
          readOnly
        />
        {error && (
          <div className="rounded-lg bg-status-booked/10 p-3 border border-status-booked/30">
            <span className="font-body-sm text-body-sm text-status-booked">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 pt-4">
          {[...Array(10).keys()].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPin((p) => (p.length < 6 ? p + n : p))}
              className="h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-heading text-headline-sm hover:bg-surface-container-high transition-colors active:scale-95"
            >
              {n === 0 ? "0" : n + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">backspace</span>
          </button>
          <button
            type="submit"
            className="h-12 rounded-lg bg-frost-cyan flex items-center justify-center text-obsidian-root font-heading text-headline-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
            disabled={pin.length < 6 || isLoading}
          >
            {isLoading ? "Logging in..." : "Enter"}
          </button>
        </div>
      </form>
    </div>
  );
}

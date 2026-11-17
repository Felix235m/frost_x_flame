"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type InChargeSession } from "@/lib/actions/in-charge";
import { Header } from "@/components/in-charge/Header";
import { BottomNav } from "@/components/in-charge/BottomNav";

export default function InChargeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<InChargeSession | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const isLoginPage =
      typeof window !== "undefined" && window.location.pathname === "/in-charge/login";

    (async () => {
      const s = await getSession();
      if (!mounted) return;
      setSession(s);
      setIsLoading(false);
      if (!s && !isLoginPage) {
        router.replace("/in-charge/login");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-obsidian-root">
        <span className="material-symbols-outlined animate-spin text-frost-cyan text-[32px]">
          loading
        </span>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined" && window.location.pathname === "/in-charge/login") {
      return <>{children}</>;
    }
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-obsidian-root text-on-surface">
      <Header session={session} />
      <main className="flex-1 overflow-y-auto p-space-sm md:p-space-lg">{children}</main>
      <BottomNav session={session} />
    </div>
  );
}
